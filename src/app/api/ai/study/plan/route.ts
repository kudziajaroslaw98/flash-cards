import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { planTypeSchema } from '#/schemas/plan-types.schema';
import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = 'ai/study/plan/flashcards';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    planType: planTypeSchema,
    duration: planDurationSchema,
    summaries: z.array(
      z.object({
        frontUuid: z.string(),
        context: z.string(),
        definition: z.string(),
        query: z.string(),
      }),
    ),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    return new Error(
      `Error: ${validityCheck.error}, message: ${validityCheck.details}`,
    );
  }
}

const rateLimit = new RateLimit(1, 10, routePath);

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

  const planTypes = {
    overview: 'Comprehensive Overview',
    'deep-dive': 'Deep Dive',
    'quick-revision': 'Quick Revision',
    'exam-prep': 'Exam Preparation',
  } as const;
  const {
    planType,
    summaries,
    duration,
  }: {
    planType: keyof typeof planTypes;
    summaries: {
      frontUuid: string;
      query: string;
      context: string;
      definition: string;
    }[];
    duration: string;
  } = await req.json();

  try {
    const error = await validateBody({
      planType,
      summaries,
      duration,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    Logger.error(
      `Invalid request body from user [${user.id}]`,
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

  const learningHours = undefined;

  Logger.info(
    `User [ ${user.id} ] is generating study plan: ${JSON.stringify({
      planType,
      duration,
      summaries: summaries.length,
      learningHours,
    })}`,
    routePath,
  );

  const prompt = `Create a study plan for a "${planTypes[planType]}" plan.
      Use all the provided summaries to generate the plan. Do not create a plan with topics that are not included in the summaries.
      Plan duration should be approximately geared towards the user's preferable learning hours per week: ${learningHours || 'Not specified'}, plan duration in days: ${duration}(days).
      Plan cannot exceed ${duration}(days) in length.

      Plan should introduce the information with increasing difficulty and complexity as the user progresses through the plan. It should keep the learning structured in very logical way. 
      For example if the plan is about learning about a topic, the plan should start with a very basic understanding of the topic and then move to a more advanced understanding of the topic.
      For example:
      1. What is variable and how it can be used -> 
      2. What is a algorithm and what types of algorithms are there ->
      3. How to leverage using algorithms

      Plan needs to use ALL ${summaries.length} summaries provided spread across the plan days.

      Structure the plan into daily study sessions. For each day, provide:
      - Day number
      - Short plan name based on the summaries provided. For example: "Variables and Data Types"
      - A list of flashcard topics to review (based on spaced repetition principles, if applicable, and the provided summaries).
      - A list of new flashcard topics to learn.
      - 2-3 summaries of day learning objectives.
      - Metrics for each day:
        * Estimated retention for each day (in percentage 0-100)
        * Maximum study time for each day (in minutes)

      The study plan should cover the following flashcard topics:
      <TOPIC_SUMMARIES>
        ${summaries.map((summary) => `- { id: ${summary.frontUuid}; topic: ${summary.context}; query: ${summary.query}; }`).join('\n')}
      </TOPIC_SUMMARIES>

      Prioritize spaced repetition for reviews and balance review with introducing new material gradually. Make the plan engaging and easy to follow.
`;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const stream = streamObject({
    model: gemini('gemini-2.0-flash-001'),
    prompt: prompt.replaceAll('\n', ' ').trim(),
    temperature: 0.7,
    system:
      'You are an expert study plan generator. Create effective and personalized study plans based on user goals and flashcard content.',
    output: 'array',
    schema: z.object({
      dayNumber: z.number(),
      objectives: z.array(z.string()),
      name: z
        .string()
        .describe(
          'Short plan name based on the summaries provided. For example: "Variables and Data Types"',
        ),
      cardsToReview: z
        .array(z.string())
        .describe('Array of flashcards frontUuids'),
      newCards: z.array(z.string()).describe('Array of flashcards frontUuids'),
      metrics: z.object({
        targetRetention: z.number(),
        maxStudyTime: z.number(),
      }),
    }),
  });

  return stream.toTextStreamResponse();
}
