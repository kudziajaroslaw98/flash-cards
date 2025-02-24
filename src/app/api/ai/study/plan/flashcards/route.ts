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
  ) => `**Objective**: Generate ${flashcardCount} unique flashcards covering [${focusTags.join(',')}] for a ${planTypes[planType]} study plan (${knowledgeLevels[knowledgeLevel]} level) and study scope: ${studyScopes[studyScope]}. 

**Critical Requirements**:
1. STRICTLY AVOID DUPLICATES: 
   - Never repeat core concepts from existing flashcards (analyzed below)
   - No conceptual duplicates even with different wording
   - No rephrased versions of same question

2. Concept Mapping Approach:
   - First analyze existing flashcards' CORE CONCEPTS (below)
   - Identify gaps in these areas: ${focusTags.join(', ')}
   - Generate NEW angles/perspectives for each tag

**Existing Flashcards Analysis** (DO NOT REPEAT THESE CORE CONCEPTS):
[START PREVIOUS]
${summaries.length > 0 ? summaries.map((s) => `- ${s.id} - ${s.topic}; ${s.context}; ${s.query}`).join('\n') : 'No previous flashcards'}
[END PREVIOUS]

**Generation Rules**:
- Each flashcard must test DISTINCT knowledge components
- Required differentiation methods:
  * Different abstraction levels (macro vs micro)
  * Different relationships (cause-effect vs comparison)
  * Different knowledge types (fact vs application)
  * Different cognitive levels (recall vs analysis)

**Examples** (BAD vs GOOD):
BAD DUPLICATES: "Define X", "What is X?", "Explain X"
GOOD UNIQUE: 
1. "X vs Y comparison" 
2. "Practical application of X"
3. "Components of X system"

Suggestion structure: 
Short unique number identifier (do not duplicate with previous id's) (id)
A concise and clear question or term for the front of the flashcard (query).
A brief and accurate definition or explanation for the back of the flashcard (definition).
A word/term used to give context of the flashcards (context).
A 1-3 tags related to this flashcard (tags).
optional Examples of use separated by semicolon (;) (examples).
optional A key points of these flashcards separated by semicolon (;) (keyPoints).
optional Synonyms to this flashcard [to context] separated by semicolon (;) (synonyms).
optional Related facts to this flashcard separated by semicolon (;) (relatedFacts).
Decide if optional fields bring value to the overall flashcard. For example, synonyms are required when the flashcard is about definition etc. Adjust flashcards to users knowledge level, keep it consistent with tags: [${focusTags.join(',')}],and the selected plan type ${planTypes[planType]} and study scope: ${studyScopes[studyScope]}.
Output the suggestions in a plain text JSON format, where each object represents a flashcard suggestion with "id", "topic", "query","context", "examples","keyPoints","synonyms","relatedFacts", "definition",and "tags" fields. 

`;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const batchSize = 40;

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
      }
    },
  });
}
