import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const maxDuration = 30;

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
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

const rateLimit = new RateLimit(1, 10, `${routePath}`);

export async function POST(req: NextRequest) {
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

  console.log(`${routePath} User [', user.id, '] is generating flashcards`);

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
  }: {
    focusTags: string[];
    studyScope: keyof typeof studyScopes;
    knowledgeLevel: keyof typeof knowledgeLevels;
    planType: keyof typeof planTypes;
    duration: string;
  } = await req.json();

  try {
    validateBody({ focusTags, studyScope, planType, duration });
  } catch {
    console.error(
      '${routePath} Invalid request body from user [',
      user.id,
      ']',
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  const prompt = `Analyze the user's existing flashcards: User don't have available flashcards. You need to generate recommendations for him.

Based on the tags: [${focusTags.join(',')}], the selected plan type ${planTypes[planType]}, and user knowledge of the subject (${knowledgeLevels[knowledgeLevel]}) suggest 10 new flashcard, adjusted to knowledge level topics and for each topic, provide:

Short unique random identifier max 6 characters (id)

A concise and clear question or term for the front of the flashcard (query).

A brief and accurate definition or explanation for the back of the flashcard (definition).

A word/term used to give context of the flashcards (context).

A 1-3 tags related to this flashcard (tags).

optional Examples of use separated by semicolon (;) (examples).

optional A key points of these flashcards separated by semicolon (;) (keyPoints).

optional Synonyms to this flashcard [to context] separated by semicolon (;) (synonyms).

optional Related facts to this flashcard separated by semicolon  (;) (relatedFacts).

Decide if optional fields bring value to the overall flashcard. For example, synonyms are required when the flashcard is about definition etc. Adjust flashcards to users knowledge level, keep it consistent with tags: [${focusTags.join(',')}],and the selected plan type ${planTypes[planType]}.

Output the suggestions in a JSON array format, where each object in the array represents a flashcard suggestion with "id", "topic", "query","context", "examples","keyPoints","synonyms","relatedFacts", "definition",and "tags" fields. 
      `;

  //   const openai = createOpenAI({
  //     apiKey: process.env.OPENAI_API_KEY,
  //   });

  console.log(
    `${new Date().toUTCString()}:[INFO]:Prompt used for ai:`,
    prompt.replaceAll('\n', ' '),
  );

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const result = streamObject({
    model: gemini('gemini-2.0-flash-001'),
    system:
      "You are an expert flashcard content generator. Your task is to suggest new flashcard topics and content to fill gaps in a user's learning material.  Focus on creating concise and informative flashcards.",
    prompt: prompt,
    output: 'array',
    temperature: 0.5,
    schema: z.object({
      id: z.string().min(1, 'required'),
      topic: z.string().min(1, 'required'),
      query: z.string().min(1, 'required'),
      context: z.string().min(1, 'required'),
      definition: z.string().min(1, 'required'),
      tags: z.array(z.string()).min(1, 'required'),
      examples: z.string(),
      keyPoints: z.string(),
      synonyms: z.string(),
      relatedFacts: z.string(),
    }),
  });

  return result.toTextStreamResponse();
}
