import { createClient } from '#/shared/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const validation = z
    .object({
      code: z.string(),
      next: z.string().includes('/flashcards/learn').or(z.string().includes('/pricing')).optional(),
    })
    .safeParse({ code, next });

  if (!validation.success) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/auth/error?error_code=invalid_redirect`,
    );
  }
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}${next}`,
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/auth/error?error_code=invalid_auth_code`,
  );
}
