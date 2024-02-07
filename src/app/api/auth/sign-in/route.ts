import { ApiResponse } from '#/shared/types/api/api-response.type';
import { SignInResponse } from '#/shared/types/api/sign-in-response.type';
import checkValidity from '#/shared/utils/check-validity.util';
import { signInValidationScheme } from '#/shared/validation-schemes/sign-in-validation.scheme';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = cookies();

  let response: ApiResponse<SignInResponse>;
  const validityCheck = checkValidity(body, signInValidationScheme);

  if (!validityCheck.valid) {
    response = {
      success: false,
      error: validityCheck.error,
    };

    return Response.json(response);
  }

  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });
  const data = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (data.error !== null) {
    response = {
      success: false,
      error: data.error.message,
    };
  } else {
    const { user_metadata, email, phone, last_sign_in_at, role } =
      data.data.user;

    response = {
      success: true,
      data: { user_metadata, email, phone, last_sign_in_at, role },
    };

    await supabase.auth.setSession({
      refresh_token: data.data.session.refresh_token,
      access_token: data.data.session.access_token,
    });
  }

  return Response.json(response);
}
