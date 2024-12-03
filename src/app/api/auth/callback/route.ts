import { createClient } from '#/shared/utils/supabase/server';
import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/`,
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/auth/auth-code-error`,
  );
}
