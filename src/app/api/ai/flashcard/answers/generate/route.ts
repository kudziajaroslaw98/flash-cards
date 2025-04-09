import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import uuid from '#/shared/utils/uuid.util';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;
const routePath = '[ai/flashcard/answers/generate]';
const rateLimit = new RateLimit(1, 10, routePath);

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    query: z
      .string()
      .min(1, 'Question must be at least 1 character')
      .max(255, 'Question must be between 1 and 255 characters'),

    definition: z
      .string()
      .min(1, 'Definition must be at least 1 character')
      .max(255, 'Definition must be between 1 and 255 characters'),
    context: z
      .string()
      .min(1, 'Context must be at least 1 character')
      .max(255, 'Context must be between 1 and 255 characters'),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    return new Error(
      `Error: ${validityCheck.error}, message: ${validityCheck.details}`,
    );
  }
}

export async function POST(req: Request) {
  const sessionId = uuid();
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      Logger.error('User not logged in', routePath);
      throw new Error('User not logged in');
    }

    if (user?.user_metadata?.stripe_subscription_status !== 'active') {
      Logger.error(
        `Session Id [ ${sessionId} ], User [${user.id}] is not subscribed to a paid plan`,
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

  const {
    query,
    definition,
    context,
  }: {
    query: string;
    definition: string;
    context: string;
  } = await req.json();

  try {
    const error = await validateBody({
      query,
      definition,
      context,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    Logger.error(
      `Session Id [ ${sessionId} ], Invalid request body from user [ ${user.id} ]`,
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
    `Session Id [ ${sessionId} ], User [ ${user.id} ] is generating answers`,
    routePath,
  );

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const prompt = `
    # GOAL: Generate one correct answer and multiple plausible incorrect distractor answers for the given flashcard query, based on its definition and context.

    # INPUTS:
    *   **Query (Question):** ${query}
    *   **Definition (Correct Answer/Explanation):** ${definition}
    *   **Context (Topic):** ${context}

    # INSTRUCTIONS:
    1.  **Identify Correct Answer (answer1):** Based *strictly* on the provided 'Definition', formulate the single correct answer ('answer1'). It should accurately reflect the information in the 'Definition'.
    2.  **Generate Incorrect Distractors (answer2, answer3, answer4):**
        *   Create 2 or 3 *incorrect* but *plausible* answers.
        *   Distractors MUST be related to the 'Context' and the 'Query'.
        *   They should seem like possible answers but be clearly wrong upon careful consideration or if the user knows the topic well. Avoid making distractors obviously silly or completely unrelated.
        *   Do not simply negate the correct answer. Ensure distractors are distinct from each other and the correct answer.
    3.  **Avoid Hints:** Do not use identical key phrases from the 'Query' in the answers if it makes the correct answer too obvious.
    4.  **Output Format:** Adhere strictly to the JSON object format with keys "answer1", "answer2", "answer3", and optionally "answer4".

    # OUTPUT JSON STRUCTURE:
    {
      "answer1": "string (Correct answer based on Definition)",
      "answer2": "string (Plausible incorrect distractor)",
      "answer3": "string (Plausible incorrect distractor)",
      "answer4": "string (Optional plausible incorrect distractor)"
    }
    `;

  const result = streamText({
    model: gemini('gemini-2.0-flash'),
    system:
      'You are an AI expert in generating high-quality multiple-choice question answers for educational flashcards. You create one correct answer and several plausible but incorrect distractors based on the provided query, definition, and context. Ensure distractors are relevant but clearly wrong for knowledgeable users.',
    prompt: prompt,
    onFinish(response) {
      Logger.info(
        `Generating flashcards session ${sessionId} finished successfully [RESPONSE DETAILS] ${JSON.stringify({ finishReason: response?.finishReason, usage: response.usage })}`,
        routePath,
      );
      Logger.info(
        `Generating flashcards session ${sessionId} finished successfully [RESPONSE] ${JSON.stringify({ steps: response?.steps.map((step) => step.response) })}`,
        routePath,
      );
    },
    onError: (error) => {
      Logger.error(
        `Generating flashcards session ${sessionId}`,
        routePath,
        JSON.stringify(error),
      );
    },
  });

  return result.toDataStreamResponse();
}
