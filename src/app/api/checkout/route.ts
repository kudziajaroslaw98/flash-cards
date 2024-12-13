import { createClient } from '#/shared/utils/supabase/server';
import { stripe } from '#/shared/utils/stripe/config';

export async function GET() {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Checkout response error - user not found');
      throw new Error('User not found');
    }

    const userUuid = user.id;
    const subscription = await stripe.subscriptions.search({
      query: `status:'active' AND metadata['user_id']:'${userUuid}'`,
    });

    if (subscription.data.length > 0) {
      console.log(
        'Subscription found for user (',
        user.id,
        '): ',
        subscription.data[0].id,
      );

      const product = await stripe.products.retrieve(
        subscription.data[0].items.data[0].price.product as string,
      );

      console.log(
        'Product found for subscription (',
        subscription.data[0].id,
        '): ',
        product.name,
      );

      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          stripe_subscription_id: subscription.data[0].id,
          stripe_subscribed_plan: product.name,
          stripe_subscription_status: subscription.data[0].status,
        },
      });

      console.log(
        'Subscription updated for user (',
        user.id,
        '): ',
        subscription.data[0].id,
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            message: 'Checkout success',
            plan: product.name,
          },
        }),
      );
    }

    console.error(
      'Checkout response error - no subscription found for user (',
      user.id,
      ')',
    );
    throw new Error('No subscription found');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Checkout error: ', error.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        { status: 400 },
      );
    } else {
      console.error('Checkout error: Unknown error');

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
