import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDataStreamResponse, Output, streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const routePath = 'ai/study/plan/incorrect-reviews';

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    summaries: z.array(
      z.object({
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

  const {
    summaries,
  }: {
    summaries: {
      frontUuid: string;
      query: string;
      context: string;
      definition: string;
    }[];
  } = await req.json();

  try {
    const error = await validateBody({
      summaries,
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
    `User [ ${user.id} ] is generating incorrect review summaries: ${JSON.stringify(
      {
        summaries: summaries.length,
        learningHours,
      },
    )}`,
    routePath,
  );

  const prompt = `
  Generate a concise, user-friendly explanation to help a learner understand why their answer to the flashcard was incorrect. Use the following structure:
1. **Simplified Definition**: Rephrase the concept in simpler terms.
2. **Common Misconceptions**: List 1-2 frequent mistakes related to this concept.
3. **Contextual Example**: Provide a real-world example or analogy.
4. **Key Takeaway**: Highlight the core idea to remember.
5. **Related Concepts**: Mention 1-2 connected topics (if applicable).
6. **Mnemonic**: Provide a short, memorable phrase to remember the concept.
7. **Visual Example**: Illustrate the concept with a diagram or image.

**Instructions**:
- Base explanations **only** on the provided flashcard data (context, query, definition).,
- Identify the most likely misunderstanding behind the wrong answer.,
- Use a friendly, encouraging tone (e.g., 'A common mix-up! Here’s the scoop...').,
- Avoid technical jargon unless the flashcard context requires it.,

**Output requirements**:
- required_fields: ["simplifiedDefinition", "commonMisconceptions", "keyTakeaway"],
- optional_fields: ["mnemonic", "visualExample", "relatedConcepts", "contextualExample"],
- forbidden: ["markdown", "unrelated topics", "assumptions about the user"]

Flashcards Data:
${summaries
  .map(
    (summary) => `- 
  **FrontUuid**: ${summary.frontUuid}
  **Context**: ${summary.context}
  **Definition**: ${summary.definition}
  **Query**: ${summary.query}
  `,
  )
  .join('\n')}
`;

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: gemini('gemini-2.0-flash-001'),
        prompt: prompt,
        temperature: 0.7,
        system:
          'You are a patient, expert tutor specializing in breaking down complex concepts into simple, memorable explanations. Your task is to help learners understand why their answer to a flashcard was incorrect, using analogies, mnemonics, and real-world examples.',
        experimental_output: Output.object({
          schema: z.array(
            z.object({
              simplifiedDefinition: z.string(),
              commonMisconceptions: z.string(),
              contextualExample: z.string().optional(),
              keyTakeaway: z.string(),
              relatedConcepts: z.string().optional(),
              mnemonic: z.string().optional(),
              visualExample: z.string().optional(),
            }),
          ),
        }),
      });

      result.mergeIntoDataStream(dataStream);
      //   for await (const chunk of partialObjectStream) {
      //     dataStream.writeData(chunk);
      //     Logger.info(`${chunk}`);
      //   }
      //   const { partialObjectStream } = streamObject({
      //     model: gemini('gemini-2.0-flash-001'),
      //     prompt: prompt,
      //     temperature: 0.7,
      //     system:
      //       'You are a patient, expert tutor specializing in breaking down complex concepts into simple, memorable explanations. Your task is to help learners understand why their answer to a flashcard was incorrect, using analogies, mnemonics, and real-world examples.',
      //     output: 'array',
      //     schema: z.object({
      //       simplifiedDefinition: z.string(),
      //       commonMisconceptions: z.string(),
      //       contextualExample: z.string().optional(),
      //       keyTakeaway: z.string(),
      //       relatedConcepts: z.string().optional(),
      //       mnemonic: z.string().optional(),
      //       visualExample: z.string().optional(),
      //     }),
      //   });

      //   for await (const chunk of partialObjectStream) {
      //     dataStream.writeData(chunk);
      //     Logger.info(`${chunk}`);
      //   }
    },
  });
}
