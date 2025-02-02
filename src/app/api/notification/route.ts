import supabaseAdmin from '#/shared/utils/supabase/admin';
import { webpush } from '#/shared/utils/webpush';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

    // Get the header value from the request
    const token = request.headers.get('x-internal-secret');

    // If the token does not match the expected secret, reject the request.
    if (token !== INTERNAL_SECRET) {
      console.error(
        '[notifications/send] Token does not match; Not internal call; Unauthorized;',
      );
      throw new Error('Unauthorized');
    }
    const { userUuid, title, body } = await request.json();
    const payload = JSON.stringify({ title, body });

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('subscription')
      .eq('user_uuid', userUuid)
      .single();

    console.log(JSON.stringify(subscription));

    if (subscription) {
      const parsedSubscription = JSON.parse(subscription.subscription);
      await webpush.sendNotification(parsedSubscription, payload);
    } else {
      console.error(
        '[notifications/send] User [',
        userUuid,
        '] has no subscription; Not sending notification',
      );
      throw new Error('User has no subscription');
    }

    return NextResponse.json({ message: 'Notification sent' }, { status: 200 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 },
    );
  }
}
