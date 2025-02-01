import { RateLimit } from '#/shared/utils/api-limiter';
import supabaseAdmin from '#/shared/utils/supabase/admin';
import { createClient } from '#/shared/utils/supabase/server';

const rateLimit = new RateLimit(1, 3, '[auth/user/delete]');

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  try {
    if (user === null || sessionError !== null) {
      console.error('[auth/user/delete] User not logged in');
      throw new Error('User not logged in');
    }

    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  console.log(
    '[auth/user/delete] User [',
    user.id,
    '] is deleting their account',
  );

  const adminAuthClient = supabaseAdmin.auth.admin;
  const { error } = await adminAuthClient.deleteUser(user.id);

  if (error) {
    console.log(
      `[auth/user/delete] Error deleting user [${user.id}]:`,
      error.code,
      error.message,
      error.name,
    );
    return Response.json({
      success: false,
      error: error.message,
    });
  }

  console.log('[auth/user/delete] User [', user.id, '] has been deleted');

  return Response.json({ success: true });
}
