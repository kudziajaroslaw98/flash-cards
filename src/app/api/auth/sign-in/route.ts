import { ApiResponse } from '#/types//api-response.type';
import { SignInResponse } from '#/types//sign-in-response.type';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import { signInValidationScheme } from '#/shared/validation-schemes/sign-in-validation.scheme';

export async function POST(request: Request) {
  const body = await request.json();

  let response: ApiResponse<SignInResponse>;
  const validityCheck = checkValidity(body, signInValidationScheme);

  if (!validityCheck.valid) {
    response = {
      success: false,
      error: validityCheck.error,
    };

    return Response.json(response);
  }

  const supabase = await createClient();
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
