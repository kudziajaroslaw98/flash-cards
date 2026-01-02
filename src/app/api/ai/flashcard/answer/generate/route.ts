import { RateLimit } from '#/shared/utils/api-limiter';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;
const rateLimit = new RateLimit(1, 10, '[ai/flashcard/answer/generate]');

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      console.error('[ai/flashcard/answer/generate] User not logged in');
      throw new Error('User not logged in');
    }

    if (user?.user_metadata?.stripe_subscription_status !== 'active') {
      console.error(
        `[ai/flashcard/answer/generate] User [${user.id}] is not subscribed to a paid plan`,
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
    '[ai/flashcard/answer/generate] User [',
    user.id,
    '] is generating',
  );

  const { prompt }: { prompt: string } = await req.json();

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const result = streamText({
    model: gemini('gemini-2.0-flash-001'),
    system:
      'You are expert in english vocabulary, you are generating descriptiops for texts. You always give unique and fitting descriptions. Do not use words from prompt to not give hints. ',
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}
