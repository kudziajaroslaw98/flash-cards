import { Logger } from '#/shared/helpers/logger/logger';
import { RateLimit } from '#/shared/utils/api-limiter';
import { createClient } from '#/shared/utils/supabase/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;
const routePath = 'ai/set/description/generate';
const rateLimit = new RateLimit(1, 10, routePath);

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  try {
    if (user === null) {
      Logger.error('User not logged in', routePath);
      throw new Error('User not logged in');
    }

    if (user.user_metadata?.stripe_subscription_status !== 'active') {
      Logger.error(
        ` User [${user.id}] is not subscribed to a paid plan`,
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

  Logger.info(`User [ ${user.id} ] is generating set description.`, routePath);

  const { prompt }: { prompt: string } = await req.json();

  const gemini = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });

  const result = streamText({
    model: gemini('gemini-2.0-flash'),
    system:
      'You are expert in english vocabulary, you are generating descriptions for flashcard sets. You always give unique and fitting descriptions.',
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}
