import checkValidity from '#/utils/functions/check-validity.util';
import { ApiResponse } from '#/utils/models/api-response.model';
import { SignUpResponse } from '#/utils/types/sign-up-response.type';
import { signUpValidationScheme } from '#/utils/validation-schemes/sign-up-validation.scheme';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  let response: ApiResponse<SignUpResponse>;

  const cookieStore = cookies();
  const body = await request.json();

  const validityCheck = checkValidity(body, signUpValidationScheme);

  if (!validityCheck.valid) {
    response = {
      success: false,
      error: validityCheck.error,
    };

    return Response.json(response);
  }

  const capitalisedFirstName =
    body.firstName.charAt(0).toUpperCase() + body.firstName.slice(1);
  const capitalisedLastName =
    body.lastName.charAt(0).toUpperCase() + body.lastName.slice(1);

  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });
  const data = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/api/auth/sign-up/confirmation`,
      data: {
        firstName: capitalisedFirstName,
        lastName: capitalisedLastName,
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
