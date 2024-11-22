import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '#/shared/utils/supabase/server';

const settingsMiddleware = async (request: NextRequest) => {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();

  if (session.data.session === null || session.error !== null) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/settings')) {
    return settingsMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings/:path*'],
};