import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { planStudyScopeSchema } from '#/schemas/plan-study-scope.schema';
import { planTypeSchema } from '#/schemas/plan-types.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDataStreamResponse, Output, streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = 'ai/study/plan/flashcards';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    focusTags: z
      .array(z.string().min(1, 'tag is required').max(255, 'tag is too long'))
      .min(1, 'Tags are required')
      .max(5, 'Max 5 tags'),
    studyScope: planStudyScopeSchema,
    knowledgeLevel: knowledgeLevelSchema,
    planType: planTypeSchema,
    duration: planDurationSchema,
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

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      Logger.error('User not logged in', routePath);
      throw new Error('User not logged in');
    }

    if (user.user_metadata?.stripe_subscription_status !== 'active') {
      Logger.error(
        `User [${user.id}] is not subscribed to a paid plan`,
        routePath,
      );
      throw new Error('User is not subscribed to a paid plan');
    }

    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

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
    Logger.error(
      `Invalid request body from user [ ${user.id} ]`,
      routePath,
      JSON.stringify(error),
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  Logger.info(
    `User [ ${user.id} ] is generating plan flashcards suggestions. Data: ${JSON.stringify(
      {
        focusTags,
        studyScope,
        planType,
        knowledgeLevel,
        duration,
        flashcardsNeeded,
      },
    )}`,
    routePath,
  );

  const prompt = (
    flashcardCount: number,
    summaries: { id: string; topic: string; query: string; context: string }[],
  ) => `
  Generate ${flashcardCount} unique flashcards covering [${focusTags.join(',')}] for a "${planTypes[planType]}" study plan, knowledge level "${knowledgeLevels[knowledgeLevel]}" and study scope: "${studyScopes[studyScope]}". 

  **User Preferences**:
    ${preferredFormats ? `• Question formats: ${preferredFormats}` : ''}
    ${contentEmphasis ? `• Emphasize: ${contentEmphasis}` : ''}
    ${learningStyle ? `• Learning style: ${learningStyle}` : ''}
    ${difficultyDistribution ? `• Difficulty: ${difficultyDistribution}` : ''}
    ${contextSetting ? `• Context: ${contextSetting}` : ''}
    ${cardLength ? `• Length: ${cardLength}` : ''}
    ${mnemonicPreference ? `• Mnemonics: ${mnemonicPreference}` : ''}
    ${blacklist ? `• AVOID topics: ${blacklist}` : ''}

  **Existing Cards** (DO NOT DUPLICATE):
${summaries
  .map(
    (summary) =>
      `• ID: ${summary.id}, Topic: ${summary.topic}, Question: ${summary.query}, Context: ${summary.context}`,
  )
  .join('\n')}

  **Critical Requirements**:
1. ADAPTIVE QUESTION FORMATS - Select based on subject matter:
   • TECHNICAL: How/why mechanisms, comparisons, applications, consequences, components
   • VOCABULARY: Contextual meaning, word relationships, usage, distinctions, register
   • PROCEDURAL: Sequential steps, preparations, tools, outcomes, troubleshooting
   • FACTUAL: Temporal/spatial knowledge, attributes, classifications, measurements

2. ANSWER QUALITY:
   • NO terms from questions in answers - avoid hint words
   • Wrong answers: plausible but clearly incorrect to experts
   • Match complexity precisely to knowledge level ${knowledgeLevels[knowledgeLevel]} - especially for expert level
   • For vocabulary: semantically related but distinct distractors

3. PLAN-SPECIFIC APPROACH:
   For "${planTypes[planType]}":
   • Overview: Broad concept coverage across cognitive levels
   • Deep-Dive: Complex relationships and detailed mechanisms
   • Quick-Revision: Essential definitions and high-yield distinctions
   • Exam-Prep: Application scenarios and analysis questions

   JSON OUTPUT per card:
{
  "id": "unique_ID",
  "topic": "main_subject",
  "query": "clear_question",
  "definition": "explanation",
  "context": "domain",
  "tags": ["relevant_tags"],
  "answer1": "correct_answer",
  "answer2-4": ["wrong_answers"],
  "examples": "optional_usage",
  "keyPoints": "optional_notes",
  "synonyms": "optional_terms",
  "relatedFacts": "optional_connections"
}

Only include optional fields when they add significant value.
`;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const batchSize = 20;

  return createDataStreamResponse({
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    async execute(dataStream) {
      const generateSeed = () => {
        return Date.now();
      };

      let streamResult = '';
      let summaries: {
        id: string;
        topic: string;
        query: string;
        context: string;
      }[] = [];

      const splitNumberIntoChunksConcise = (): number[] =>
        flashcardsNeeded <= 0 || batchSize <= 0
          ? []
          : Array.from(
              { length: Math.ceil(flashcardsNeeded / batchSize) },
              (_, i) => Math.min(batchSize, flashcardsNeeded - i * batchSize),
            );

      for (const chunk of splitNumberIntoChunksConcise()) {
        if (streamResult && streamResult !== '') {
          summaries = (
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
            id: suggestion.id,
            topic: suggestion.topic,
            query: suggestion.query,
            context: suggestion.context,
          }));
        }

        streamResult = await new Promise((resolve, reject) => {
          const stream = streamText({
            model: gemini('gemini-2.0-flash-001'),
            prompt: prompt(chunk, summaries).replaceAll('\n', ' ').trim(),
            temperature: 0.7,
            system: `You are an expert educational content designer specializing in creating high-quality, pedagogically sound flashcards. Your primary responsibilities are:

1. UNIQUENESS: Generate flashcards that explore DISTINCT concepts, avoiding semantic overlap or reformulation of existing content.

2. PEDAGOGICAL VARIETY: Craft questions across multiple cognitive domains (from basic recall to complex evaluation) and diverse formats (definitions, applications, comparisons, problem-solving).

3. KNOWLEDGE CALIBRATION: Precisely match content difficulty to the specified knowledge level - from foundational concepts for beginners to cutting-edge applications for experts.

4. SUBJECT ADAPTABILITY: Tailor your approach based on subject matter (technical concepts, vocabulary, procedures, factual content) and study purpose (comprehensive overview, deep dive, revision, exam prep).

5. ANSWER QUALITY: Create clearly correct answers and plausible but definitively incorrect distractors that don't hint at the correct response.

Your expertise spans disciplines from technical fields to languages, sciences to humanities. For each flashcard set, you analyze existing content to identify knowledge gaps, then strategically fill those gaps with carefully crafted new cards that expand the user's understanding in meaningful ways.`,
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
                  answer1: z.string(),
                  answer2: z.string(),
                  answer3: z.string(),
                  answer4: z.string(),
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
      }
    },
  });
}
