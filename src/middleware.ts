import { createClient } from '#/shared/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const settingsMiddleware = async (request: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user === null || error !== null) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
};

const signInMiddleware = async (request: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const searchParams = new URL(request.url).searchParams;

  if (user !== null && error === null) {
    if (searchParams.get('redirect') === 'pricing') {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
    return NextResponse.redirect(new URL('/flashcards/learn', request.url));
  } else {
    return NextResponse.next();
  }
};

const pricingMiddleware = async (request: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user === null || error !== null) {
    return NextResponse.redirect(
      new URL('/sign-in?redirect=pricing', request.url),
    );
  }
};

// const studyMiddleware = async (request: NextRequest) => {
//   const supabase = await createClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.getUser();

//   if (user === null || error !== null) {
//     return NextResponse.redirect(
//       new URL('/sign-in?redirect=pricing', request.url),
//     );
//   }
// };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  await updateSession(request);

  if (request.nextUrl.pathname.startsWith('/account/settings')) {
    return settingsMiddleware(request);
  }

  if (request.nextUrl.pathname.startsWith('/sign-in')) {
    return signInMiddleware(request);
  }

  if (request.nextUrl.pathname.startsWith('/pricing')) {
    return pricingMiddleware(request);
  }

  // if (request.nextUrl.pathname.startsWith('/study')) {
  //   return studyMiddleware(request);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
