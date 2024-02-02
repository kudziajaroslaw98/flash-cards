import checkValidity from '#/utils/functions/check-validity.util';
import { ApiResponse } from '#/utils/models/api-response.model';
import { SignUpResponse } from '#/utils/types/sign-up-response.type';
import { signUpValidationScheme } from '#/utils/validation-schemes/sign-up-validation.scheme';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = cookies();

  let response: ApiResponse<SignUpResponse>;
  const validityCheck = checkValidity(body, signUpValidationScheme);
  const url = new URL(request.url);

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
  const data = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      emailRedirectTo: `${url.origin}/learn`,
      // todo: change the emailRedirectTo to the URL of your confirmation page
      //   emailRedirectTo: `${url.origin}/sign-up/confirmation`,
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
      },
    },
  });

  if (data.error !== null) {
    response = {
      success: false,
      error: data.error.message,
    };
  } else {
    response = { success: true, data: { message: 'Sign up successful' } };

    if (data.data.session) {
      await supabase.auth.setSession({
        refresh_token: data.data.session.refresh_token,
        access_token: data.data.session.access_token,
      });
    }

    if (data.data.user) {
      const { user_metadata, email, phone, last_sign_in_at, role } =
        data.data.user;

      response = {
        success: true,
        data: { user_metadata, email, phone, last_sign_in_at, role },
      };
    }
  }

  return Response.json(response);
}
