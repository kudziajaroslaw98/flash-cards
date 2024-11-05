import { FlashCard } from '#/shared/models/flash-card.model';
import { generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { flashCards: flashcards, setName } = await req.json();

  const ollama = createOllama({
    baseURL: 'http://localhost:11434/api',
  });

  const prompt = `Generate 4 meaningful flash cards that will fit a set with name: ${setName} and cannot be duplicated with those: 
      ${flashcards.map(
        (flashcard: FlashCard) => `${flashcard.questionAddition.trim()}`,
      )}. output needs to be in JSON format and object with following fields: word, definition.`;

  const result = await generateObject({
    model: ollama('mistral:7b-instruct'),
    output: 'array',
    schema: z.object({
      word: z.string(),
      definition: z.string(),
    }),
    system:
      'You are expert in english vocabulary, you are generating flash cards for learning. You always give unique and fitting words.',
    prompt: prompt,
  });

  // TODO: add validation
  // TODO: add error handling

  return new Response(JSON.stringify(result.object));
}
