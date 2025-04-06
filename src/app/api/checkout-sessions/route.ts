import { stripe } from '#/shared/utils/stripe/config';
import { createClient } from '#/shared/utils/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic'; // defaults to auto

const planValidationSchema = z.enum(['free', 'premium']);
const paymentValidationSchema = z.enum(['monthly', 'yearly']).nullish();

const createOrRetrieveCustomerId = async (
  user: User,
  supabase: SupabaseClient,
) => {
  if (!user.user_metadata?.stripe_customer_id) {
    console.log(
      '[checkout-session] user (',
      user.id,
      ') does not have a Stripe customer ID',
    );

    const customer = await stripe.customers.create({
      email: user?.email,
      name: user.user_metadata?.name,
      metadata: {
        user_id: user.id,
      },
    });

    console.log(
      '[checkout-session] created Stripe customer (',
      customer.id,
      ') for user (',
      user.id,
      ')',
    );

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        stripe_customer_id: customer.id,
      },
    });

    if (updateError) {
      console.error(
        '[checkout-session] checkout error - failed to update user (',
        user.id,
        ') metadata: ',
        updateError,
      );
      throw new Error('Failed to update user metadata');
    }
  }
  // TODO: Add customer id to database

  return user.user_metadata.stripe_customer_id;
};

const createOrRetrieveCheckoutSession = async (
  customerId: string,
  user: User,
  request: Request,
  plan: 'free' | 'premium',
  payment?: 'monthly' | 'yearly' | null,
) => {
  const checkoutSessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'open',
    limit: 1,
  });

  if (checkoutSessions.data.length > 0) {
    console.log(
      '[checkout-session] open checkout sessions found for user (',
      user.id,
      ') - ',
      checkoutSessions.data[0].id,
    );

    if (checkoutSessions.data[0].url) {
      return checkoutSessions.data[0];
    }
    console.error(
      '[checkout-session] checkout error - checkout session has no url: ',
      checkoutSessions.data[0],
      ', proceeding to create new checkout session',
    );
  } else {
    console.log(
      '[checkout-session] no open checkout sessions found for user (',
      user.id,
      ')',
    );
  }
  console.log(
    '[checkout-session] creating new checkout session for user (',
    user.id,
    ')',
  );

  const productionPrices = {
    premium_monthly: 'price_1QTmyMDKMh5G3jeEjRhDFjXH',
    premium_yearly: 'price_1R9CseDKMh5G3jeENPoPsI32',
  };

  const developmentPrices = {
    premium_monthly: 'price_1QUDAGDKMh5G3jeEEXb0W0tg',
    premium_yearly: 'price_1R9DDADKMh5G3jeEuQH7iJtk',
  };

  let priceId = '';
  const monthly =
    process.env.NODE_ENV === 'production'
      ? productionPrices.premium_monthly
      : developmentPrices.premium_monthly;
  const yearly =
    process.env.NODE_ENV === 'production'
      ? productionPrices.premium_yearly
      : developmentPrices.premium_yearly;

  if (plan === 'free') {
    priceId = monthly;
  } else {
    if (payment === 'monthly') {
      priceId = monthly;
    } else if (payment === 'yearly') {
      priceId = yearly;
    } else {
      priceId = monthly;
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
      },
    },
    mode: 'subscription',
    cancel_url: `${request.headers.get('origin')}/checkout?cancel=true`,
    success_url: `${request.headers.get('origin')}/checkout?success=true`,
  });

  console.log(
    '[checkout-session] created checkout session (',
    checkoutSession.id,
    ') for user (',
    user.id,
    ')',
  );

  return checkoutSession;
};

export async function POST(request: Request) {
  try {
    const plan = new URL(request.url).searchParams.get('plan');
    const payment = new URL(request.url).searchParams.get('payment');
    const planValidation = planValidationSchema.safeParse(plan);
    const paymentValidation = paymentValidationSchema.safeParse(payment);

    if (!planValidation.success || !paymentValidation.success) {
      console.error(
        '[checkout-session] checkout error - invalid plan or payment:',
        planValidation?.error?.message,
        paymentValidation?.error?.message,
      );
      throw new Error('Invalid plan');
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user === null || error) {
      console.error(
        '[checkout-session] checkout error - user not found: ',
        error,
      );
      throw new Error('User not found');
    }

    const customerId = await createOrRetrieveCustomerId(user, supabase);
    const checkoutSession = await createOrRetrieveCheckoutSession(
      customerId,
      user,
      request,
      planValidation.data,
      paymentValidation.data,
    );

    console.log(
      '[checkout-session] redirecting user (',
      user.id,
      ') to checkout session (',
      checkoutSession.id,
      checkoutSession.url,
      ')',
    );

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch (error) {
    if (error instanceof Error) {
      console.error('[checkout-session] checkout error: ', error.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400 },
      );
    } else {
      console.error('[checkout-session] checkout error: Unknown error');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unknown error',
        }),
        { status: 500 },
      );
    }
  }
}
