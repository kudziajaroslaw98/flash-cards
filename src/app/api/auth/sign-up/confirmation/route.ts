import { createClient } from '#/shared/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/sign-in`,
    );
  }

  const supabase = await createClient();
  const data = await supabase.auth.exchangeCodeForSession(code);

  if (data.data.session) {
    await supabase.auth.setSession({
      refresh_token: data.data.session.refresh_token,
      access_token: data.data.session.access_token,
    });
  }

  return Response.redirect(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/learn`);
}
