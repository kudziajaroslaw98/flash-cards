import { createClient } from '#/shared/utils/supabase/server';
import { RateLimit } from '#/shared/utils/api-limiter';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;
const rateLimit = new RateLimit(1, 10);

export async function POST(req: Request) {
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

  const { prompt }: { prompt: string } = await req.json();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const result = streamText({
    model: openai('gpt-3.5-turbo-0125'),
    system:
      'You are expert in english vocabulary, you are generating descriptiops for texts. You always give unique and fitting descriptions. Do not use words from prompt to not give hints. ',
    prompt: prompt,
  });

  return result.toDataStreamResponse();
}
