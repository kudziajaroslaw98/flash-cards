import { createClient as createClientSupabase } from '@supabase/supabase-js';
import { createClient } from '#/shared/utils/supabase/server';
import { RateLimit } from '#/shared/utils/api-limiter';

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

  const supabaseAdmin = createClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const adminAuthClient = supabaseAdmin.auth.admin;
  const { error } = await adminAuthClient.deleteUser(user.id);

  if (error) {
    console.error(
      `[auth/user/delete] Error deleting user [${user.id}]:`,
      error,
    );
    return Response.json({
      success: false,
      error: error.message,
    });
  }

  console.log('[auth/user/delete] User [', user.id, '] has been deleted');

  return Response.json({ success: true });
}
