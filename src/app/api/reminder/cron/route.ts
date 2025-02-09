import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

    console.log('[reminder/cron] Received request');
    console.log('[reminder/cron] headers', JSON.stringify(request.headers));
    console.log(
      '[reminder/cron] secret',
      request?.headers?.get('x-internal-secret'),
    );
    // Get the header value from the request
    const token = request.headers.get('x-internal-secret');

    // If the token does not match the expected secret, reject the request.
    if (token !== INTERNAL_SECRET) {
      console.error('[reminder/cron] Token does not match; Unauthorized;');
      throw new Error('Unauthorized');
    }

    console.log('[reminder/cron] Token matches; Authorized;');

    return NextResponse.json({ message: 'Notification sent' }, { status: 200 });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 },
    );
  }
}
