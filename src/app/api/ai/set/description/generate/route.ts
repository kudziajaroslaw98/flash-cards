import { createClient } from '#/shared/utils/supabase/server';
import { RateLimit } from '#/shared/utils/api-limiter';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;
const rateLimit = new RateLimit(1, 10, '[ai/set/description/generate]');

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      console.error('[ai/set/description/generate] User not logged in');
      throw new Error('User not logged in');
    }

    if (user.user_metadata?.stripe_subscription_status !== 'active') {
      console.error(
        `[ai/set/description/generate] User [${user.id}] is not subscribed to a paid plan`,
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

  console.log(
    '[ai/set/description/generate] User [',
    user.id,
    '] is generating',
  );

  const { prompt }: { prompt: string } = await req.json();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const result = streamText({
    model: openai('gpt-3.5-turbo-0125'),
    system:
      'You are expert in english vocabulary, you are generating descriptiops for flashcard sets. You always give unique and fitting descriptions. Dont quote answer.',
    prompt: prompt,
  });

  return result.toDataStreamResponse();
}
