import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { z } from 'zod';

const rateLimit = new RateLimit(1, 10, '[notifications/subscribe]');

type requestBody = {
  subscription: PushSubscription;
};

async function validateBody(body: { subscription: PushSubscription }) {
  const validationBody = {
    subscription: {
      endpoint: body?.subscription?.endpoint,
      expirationTime: body?.subscription?.endpoint,
    },
  };
  const validationScheme = z.object({
    subscription: z.object({
      endpoint: z.string(),
      expirationTime: z.number().nullable().or(z.string()),
    }),
  });
  const validityCheck = checkValidity(validationBody, validationScheme);

  if (!validityCheck.valid) {
    console.error(
      '[notifications/unsubscribe] Invalid body',
      validityCheck.error,
    );
    throw new Error(validityCheck.error);
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  try {
    if (user === null || error !== null) {
      console.error('[notifications/unsubscribe] User not logged in');
      throw new Error('User not logged in');
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

  try {
    const body: requestBody = await request.json();
    validateBody(body);

    const { subscription } = body;
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_uuid', user.id)
      .eq('subscription->>endpoint', subscription.endpoint);

    if (error) {
      console.error(
        '[notifications/unsubscribe] Error unsubscribing from notifications',
        error,
      );
      throw new Error('Error unsubscribing from notifications');
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
    );
  } catch (error) {
    console.error('[notifications/unsubscribe] Error validating body', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error validating body',
      }),
    );
  }
}
