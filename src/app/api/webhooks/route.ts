import supabaseAdmin from '#/shared/utils/supabase/admin';
import { stripe } from '#/shared/utils/stripe/config';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic' // defaults to auto

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    console.log('[webhooks] event type:', event.type);
    const subscription = event.data.object as Stripe.Subscription;
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.getUserById(
      subscription.metadata.user_id,
    );

    if (user === null || error) {
      console.error('[webhooks] user not found: ', error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400,
        },
      );
    }

    if (event.type === 'customer.subscription.deleted') {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          stripe_subscription_id: null,
          stripe_subscribed_plan: null,
          stripe_subscription_status: null,
        },
      });

      console.log('[webhooks] subscription deleted for user (', user.id, ')');
    } else {
      const product = await stripe.products.retrieve(
        subscription.items.data[0].price.product as string,
      );

      console.log(
        '[webhooks] product found for subscription (',
        subscription.id,
        '): ',
        product.name,
      );

      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          stripe_subscription_id: subscription.id,
          stripe_subscribed_plan: product.name.toLowerCase(),
          stripe_subscription_status: subscription.status,
        },
      });

      console.log(
        '[webhooks] subscription updated for user (',
        user.id,
        '): ',
        subscription.id,
        ', status: ',
        subscription.status,
        ', plan: ',
        product.name,
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
