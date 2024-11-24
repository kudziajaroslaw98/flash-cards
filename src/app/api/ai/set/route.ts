import { FlashCard } from "#/shared/models/flash-card.model";
import { z } from "zod";
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from "#/shared/utils/supabase/server";
import { isLoggedIn } from "#/shared/utils/supabase/supabase-helpers";



export const maxDuration = 30;

export async function POST(req: Request) {
  const { flashCards: flashcards, setName } = await req.json();
  const supabase = await createClient();

  if (await !isLoggedIn(supabase)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "User not logged in",
      }),
    );
  }

  const prompt = `Generate 4 meaningful flash cards that will fit a set with name: ${setName} and cannot be duplicated with those: 
      ${flashcards.map(
    (flashcard: FlashCard) => `${flashcard.questionAddition.trim()}`,
  )}. output needs to be in JSON format and object with following fields: word, definition.`;

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
      'You are expert in english vocabulary, you are generating flash cards for learning. You always give unique and fitting words.',
    prompt: prompt,
  });

  return new Response(JSON.stringify(result.object));
}
