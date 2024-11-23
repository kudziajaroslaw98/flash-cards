import { NextResponse } from 'next/server'
import { createClient } from '#/shared/utils/supabase/server'
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const provider = searchParams.get('provider');
  const supabase = await createClient();

  if (provider === 'google') {
    return;
  } else if (provider === 'github') {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/api/auth/callback`,
      },
    });

    console.log(data)

    if (data.url) {
      redirect(data.url)
    }
  }

  console.log(origin)
  console.log(searchParams)
  console.log(code)


  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    console.log(error)

    if (!error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/`)
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/auth/auth-code-error`)
}

