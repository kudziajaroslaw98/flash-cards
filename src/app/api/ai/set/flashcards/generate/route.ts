import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { RateLimit } from '#/shared/utils/api-limiter';
import type { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    flashcards: z.array(
      z
        .string()
        .min(1, 'Flash card is required')
        .max(255, 'Flash card is too long'),
    ),
    setName: z.string().min(1),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

const rateLimit = new RateLimit(1, 10);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (user === null) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'User not logged in',
      }),
    );
  }

  try {
    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  const { flashCards: flashcards, setName } = await req.json();

  try {
    validateBody({ flashcards, setName });
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
      }),
    );
  }

  const prompt = `Generate 8 meaningful flash cards that will fit a set with name: ${setName} and cannot be duplicated with those words under any circumstances: 
      ${flashcards.map((flashcard: string) => `${flashcard.trim()}`)}. `;

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const result = await generateObject({
    model: openai('gpt-3.5-turbo-0125'),
    output: 'array',
    schema: z.object({
      word: z.string(),
      definition: z.string(),
    }),
    system:
      'You are expert in english vocabulary, you are generating flash cards for learning. You always give unique and fitting words. Output needs to be in JSON format and object with following fields: word, definition. Do not use words from prompt to not give hints.',
    prompt: prompt,
    presencePenalty: 1,
  });

  return new Response(JSON.stringify(result.object));
}
