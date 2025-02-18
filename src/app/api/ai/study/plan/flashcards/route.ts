import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDataStreamResponse, Output, streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = '[ai/study/plan/flashcards]';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    focusTags: z
      .array(z.string().min(1, 'tag is required').max(255, 'tag is too long'))
      .min(1, 'Tags are required')
      .max(5, 'Max 5 tags'),
    studyScope: z
      .string()
      .min(1, 'Study Scope is required')
      .refine(
        (value) => ['default', 'comprehensive', 'specific'].includes(value),
        'Study Scope is invalid',
      ),
    knowledgeLevel: z
      .string()
      .min(1, 'Knowledge Level is required')
      .refine(
        (value) =>
          [
            'unfamiliar',
            'beginner',
            'developing',
            'proficient',
            'advanced',
            'expert',
          ].includes(value),
        'Knowledge Level is invalid',
      ),
    planType: z
      .string()
      .min(1, 'Plan Type is required')
      .refine(
        (value) =>
          ['overview', 'deep-dive', 'quick-review', 'exam-prep'].includes(
            value,
          ),
        'Plan Type is invalid',
      ),
    duration: z
      .string()
      .min(1, 'Duration is required')
      .refine(
        (value) => ['1', '3', '5', '7', '14', '30'].includes(value),
        'Duration is invalid',
      ),
    flashcardsNeeded: z
      .number()
      .min(1, 'Flashcards Needed is required')
      .max(500, 'Max 500 flashcards'),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    return new Error(
      `Error: ${validityCheck.error}, message: ${validityCheck.details}`,
    );
  }
}

const rateLimit = new RateLimit(1, 10, `${routePath}`);

export async function POST(req: NextRequest, res: NextRequest) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      console.error(`${routePath} User not logged in`);
      throw new Error('User not logged in');
    }

    //   TODO: uncomment
    // if (user.user_metadata?.stripe_subscription_status !== 'active') {
    //   console.error(`${routePath} User is not subscribed to a paid plan`);
    //   throw new Error('User is not subscribed to a paid plan');
    // }

    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  console.log(`${routePath} User [ ${user.id} ] is generating flashcards`);

  const studyScopes = {
    default: 'Focus on Core Concepts',
    comprehensive: 'Comprehensive Coverage',
    specific: 'Specific Area within Tags',
  } as const;
  const planTypes = {
    overview: 'Comprehensive Overview',
    'deep-dive': 'Deep Dive',
    'quick-revision': 'Quick Revision',
    'exam-prep': 'Exam Preparation',
  } as const;
  const knowledgeLevels = {
    unfamiliar: 'Unfamiliar knows (1-15%) of the material',
    beginner: 'Beginner knows (16-30%) of the material',
    developing: 'Developing knows (31-55%) of the material',
    proficient: 'Proficient knows (56-75%) of the material',
    advanced: 'Advanced knows (76-90%) of the material',
    expert: 'Expert knows (91-100%) of the material',
  } as const;
  const recommendedFlashcardsCount = {
    overview: {
      '1': [10, 15],
      '3': [30, 45],
      '5': [50, 75],
      '7': [70, 100],
      '14': [140, 200],
      '30': [300, 450],
    },
    'deep-dive': {
      '1': [10, 15],
      '3': [25, 35],
      '5': [40, 60],
      '7': [60, 80],
      '14': [120, 160],
      '30': [250, 350],
    },
    'quick-review': {
      '1': [5, 10],
      '3': [15, 25],
      '5': [25, 40],
      '7': [40, 60],
      '14': [80, 120],
      '30': [150, 250],
    },
    'exam-prep': {
      '1': [15, 20],
      '3': [40, 50],
      '5': [60, 80],
      '7': [80, 120],
      '14': [160, 240],
      '30': [350, 500],
    },
  } as const;

  const {
    focusTags,
    studyScope,
    knowledgeLevel,
    planType,
    duration,
    flashcardsNeeded,
  }: {
    focusTags: string[];
    studyScope: keyof typeof studyScopes;
    knowledgeLevel: keyof typeof knowledgeLevels;
    planType: keyof typeof planTypes;
    duration: string;
    flashcardsNeeded: number;
  } = await req.json();

  try {
    const error = await validateBody({
      focusTags,
      studyScope,
      planType,
      knowledgeLevel,
      duration,
      flashcardsNeeded,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(
      `${routePath} Invalid request body from user [`,
      user.id,
      '], error: ',
      JSON.stringify(error),
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  const prompt = (
    flashcardCount: number,
    summaries: { topic: string; query: string; context: string }[],
  ) => `
It is crucial that you generate a substantial list of flashcard suggestions, aiming for approximately ${flashcardCount} high-quality flashcards. The goal is to create a set of flashcards covering all key aspects of the tags [${focusTags.join(',')}], for a "${planTypes[planType]}" study plan and  knowledge of the subject (${knowledgeLevels[knowledgeLevel]}).
Important: AVOID GENERATING DUPLICATE OR NEAR-DUPLICATE FLASHCARDS.
What is considered a duplicate?** Flashcards that test the same core concept or idea, even if worded slightly differently, are considered duplicates.  Simply rephrasing a definition or question is NOT creating a new, unique flashcard.
Example of what to AVOID (Duplicates):
- Duplicates:
  - Flashcard 1 Query: "Define Photosynthesis"
  - Flashcard 2 Query: "What is the definition of Photosynthesis?"
  - Flashcard 3 Query: "Explain the process of Photosynthesis"  (All these are testing the same core concept)

Example of good non-duplicates: 
- Non-Duplicates (Good):
  - Flashcard 1 Query: "Define Photosynthesis"
  - Flashcard 2 Query: "What are the reactants of Photosynthesis?" (Different aspect - inputs)
  - Flashcard 3 Query: "What are the products of Photosynthesis?" (Different aspect - outputs)
  - Flashcard 4 Query: "Where does Photosynthesis occur in plant cells?" (Different aspect - location)
Analyze the user's existing flashcards to not duplicate them:
[START OF PREVIOUS FLASHCARD SUMMARIES]
  ${summaries.length > 0 ? JSON.stringify(summaries, null, 2) : 'No previous flashcard summaries provided (this is the first iteration).'}
[END OF PREVIOUS FLASHCARD SUMMARIES]

Based on the previous suggestions, tags: [${focusTags.join(',')}], the selected plan type ${planTypes[planType]}, and user knowledge of the subject (${knowledgeLevels[knowledgeLevel]}) suggest ${flashcardCount} new flashcards, adjusted to knowledge level topics and for each topic, provide non-duplicate:
Short unique random identifier max 10 characters (id)
A concise and clear question or term for the front of the flashcard (query).
A brief and accurate definition or explanation for the back of the flashcard (definition).
A word/term used to give context of the flashcards (context).
A 1-3 tags related to this flashcard (tags).
optional Examples of use separated by semicolon (;) (examples).
optional A key points of these flashcards separated by semicolon (;) (keyPoints).
optional Synonyms to this flashcard [to context] separated by semicolon (;) (synonyms).
optional Related facts to this flashcard separated by semicolon (;) (relatedFacts).
Decide if optional fields bring value to the overall flashcard. For example, synonyms are required when the flashcard is about definition etc. Adjust flashcards to users knowledge level, keep it consistent with tags: [${focusTags.join(',')}],and the selected plan type ${planTypes[planType]}.
Output the suggestions in a plain text JSON format, where each object represents a flashcard suggestion with "id", "topic", "query","context", "examples","keyPoints","synonyms","relatedFacts", "definition",and "tags" fields. 
      `;

  //   const openai = createOpenAI({
  //     apiKey: process.env.OPENAI_API_KEY,
  //   });

  // console.log(
  //   `${new Date().toUTCString()}:[INFO]:Prompt used for ai:`,
  //   prompt().replaceAll('\n', ' '),
  // );

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  // const result = streamObject({
  //   model: gemini('gemini-2.0-flash-001'),
  //   system:
  //     "You are an expert flashcard content generator. Your task is to suggest new flashcard topics and content to fill gaps in a user's learning material.  Focus on creating concise and informative flashcards.",
  //   prompt: prompt.replaceAll('\n', ' ').trim(),
  //   output: 'array',
  //   temperature: 0.5,
  //   schema: z.object({
  //     id: z.string(),
  //     topic: z.string(),
  //     query: z.string(),
  //     context: z.string(),
  //     definition: z.string(),
  //     tags: z.array(z.string()),
  //     examples: z.string(),
  //     keyPoints: z.string(),
  //     synonyms: z.string(),
  //     relatedFacts: z.string(),
  //   }),
  // });

  // return result.toTextStreamResponse();
  const batchSize = 40;

  return createDataStreamResponse({
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    async execute(dataStream) {
      // const firstPrompt = `Analyze the user's existing flashcards: User don't have available flashcards. You need to generate recommendations for him.
      // Based on the tags: [${focusTags.join(',')}], the selected plan type ${planTypes[planType]}, and user knowledge of the subject (${knowledgeLevels[knowledgeLevel]}) suggest ${batchCount} new flashcards, adjusted to knowledge level topics and for each topic, provide:
      // ${prompt}
      // Output the suggestions in a JSON array format, where each object in the array represents a flashcard suggestion with "id", "topic", "query","context", "examples","keyPoints","synonyms","relatedFacts", "definition",and "tags" fields.`;
      //       const otherPrompt = `Analyze the user's existing flashcards: User don't have available flashcards. You need to generate recommendations for him.
      // Based on the tags: [${focusTags.join(',')}], the selected plan type ${planTypes[planType]}, and user knowledge of the subject (${knowledgeLevels[knowledgeLevel]}) suggest ${batchCount} new flashcards, adjusted to knowledge level topics and for each topic, provide:
      // ${prompt}
      // Output the suggestions in a JSON format, where each object represents a flashcard suggestion with "id", "topic", "query","context", "examples","keyPoints","synonyms","relatedFacts", "definition",and "tags" fields.`;
      // // Write data
      // dataStream.writeData({ value: 'Hello' });

      // // Write annotation
      // dataStream.writeMessageAnnotation({
      //   type: 'status',
      //   value: 'processing',
      // });

      // Merge another stream
      // const otherStream = getAnotherStream();

      // for (let i = 0; i < batchCount; i++) {
      // Merge another stream
      // if (i === 0) {

      const generateSeed = () => {
        return Date.now();
      };

      let streamResult: string = await new Promise((resolve, reject) => {
        const stream = streamText({
          model: gemini('gemini-2.0-flash-001'),
          prompt: prompt(batchSize, []).replaceAll('\n', ' ').trim(),
          temperature: 0.7,
          system:
            "You are an expert flashcard content generator focused on creating UNIQUE and NON-REDUNDANT flashcards. Your primary goal is to expand the user's knowledge base with NEW and DISTINCT concepts related to the given topic.  Avoid generating flashcards that are semantically similar to concepts already covered. Prioritize novelty and comprehensive topic coverage.",
          experimental_output: Output.object({
            schema: z.array(
              z.object({
                id: z.string(),
                topic: z.string(),
                query: z.string(),
                context: z.string(),
                definition: z.string(),
                tags: z.array(z.string()),
                examples: z.string(),
                keyPoints: z.string(),
                synonyms: z.string(),
                relatedFacts: z.string(),
              }),
            ),
          }),
          seed: generateSeed(),
          onFinish: () => {
            resolve(stream.text);
          },
          onError: () => {
            reject(undefined);
          },
        });
        stream.mergeIntoDataStream(dataStream);
      });

      let summaries = (
        JSON.parse(streamResult) as {
          id: string;
          topic: string;
          query: string;
          context: string;
          definition: string;
          tags: string[];
          examples: string;
          keyPoints: string;
          synonyms: string;
          relatedFacts: string;
        }[]
      ).map((suggestion) => ({
        topic: suggestion.topic,
        query: suggestion.query,
        context: suggestion.context,
      }));

      console.log(JSON.stringify(summaries));

      streamResult = await new Promise((resolve, reject) => {
        const stream = streamText({
          model: gemini('gemini-2.0-flash-001'),
          prompt: prompt(batchSize, summaries).replaceAll('\n', ' ').trim(),
          system:
            "You are an expert flashcard content generator focused on creating UNIQUE and NON-REDUNDANT flashcards. Your primary goal is to expand the user's knowledge base with NEW and DISTINCT concepts related to the given topic.  Avoid generating flashcards that are semantically similar to concepts already covered. Prioritize novelty and comprehensive topic coverage.",
          temperature: 0.7,
          experimental_output: Output.object({
            schema: z.array(
              z.object({
                id: z.string(),
                topic: z.string(),
                query: z.string(),
                context: z.string(),
                definition: z.string(),
                tags: z.array(z.string()),
                examples: z.string(),
                keyPoints: z.string(),
                synonyms: z.string(),
                relatedFacts: z.string(),
              }),
            ),
          }),
          seed: generateSeed(),
          onFinish: () => {
            resolve(stream.text);
          },
          onError: () => {
            reject(undefined);
          },
        });
        stream.mergeIntoDataStream(dataStream);
      });

      summaries = [
        ...summaries,
        ...(
          JSON.parse(streamResult) as {
            id: string;
            topic: string;
            query: string;
            context: string;
            definition: string;
            tags: string[];
            examples: string;
            keyPoints: string;
            synonyms: string;
            relatedFacts: string;
          }[]
        ).map((suggestion) => ({
          topic: suggestion.topic,
          query: suggestion.query,
          context: suggestion.context,
        })),
      ];

      console.log(JSON.stringify(summaries));

      streamResult = await new Promise((resolve, reject) => {
        const stream = streamText({
          model: gemini('gemini-2.0-flash-001'),
          prompt: prompt(batchSize, summaries).replaceAll('\n', ' ').trim(),
          system:
            "You are an expert flashcard content generator focused on creating UNIQUE and NON-REDUNDANT flashcards. Your primary goal is to expand the user's knowledge base with NEW and DISTINCT concepts related to the given topic.  Avoid generating flashcards that are semantically similar to concepts already covered. Prioritize novelty and comprehensive topic coverage.",
          temperature: 0.7,
          experimental_output: Output.object({
            schema: z.array(
              z.object({
                id: z.string(),
                topic: z.string(),
                query: z.string(),
                context: z.string(),
                definition: z.string(),
                tags: z.array(z.string()),
                examples: z.string(),
                keyPoints: z.string(),
                synonyms: z.string(),
                relatedFacts: z.string(),
              }),
            ),
          }),
          seed: generateSeed(),
          onFinish: () => {
            resolve(stream.text);
          },
          onError: () => {
            reject(undefined);
          },
        });
        stream.mergeIntoDataStream(dataStream);
      });
      // }
      // return textStream.toTextStreamResponse();
      // const text2Stream = streamText({
      //   model: gemini('gemini-2.0-flash-001'),
      //   prompt: prompt.replaceAll('\n', ' ').trim(),
      //   temperature: 0.5,
      //   experimental_output: Output.object({
      //     schema: z.array(
      //       z.object({
      //         id: z.string(),
      //         topic: z.string(),
      //         query: z.string(),
      //         context: z.string(),
      //         definition: z.string(),
      //         tags: z.array(z.string()),
      //         examples: z.string(),
      //         keyPoints: z.string(),
      //         synonyms: z.string(),
      //         relatedFacts: z.string(),
      //       }),
      //     ),
      //   }),
      // });

      // return textStream.toTextStreamResponse();
      // text2Stream.pipeTextStreamToResponse(res);

      // return res;
      // text2Stream.mergeIntoDataStream(dataStream);
      // }
      // else {
      //   const textStream = streamText({
      //     model: gemini('gemini-2.0-flash-001'),
      //     prompt: otherPrompt.replaceAll('\n', ' ').trim(),
      //     temperature: 0.5,
      //   });

      //   textStream.mergeIntoDataStream(dataStream);
      // }
      // }
    },
    onError: (error) => `Custom error: ${error.message}`,
  });
}
