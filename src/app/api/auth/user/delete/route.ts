import { createClient as createClientSupabase } from '@supabase/supabase-js';
import { createClient } from '#/shared/utils/supabase/server';
import { RateLimit } from '#/shared/utils/api-limiter';

const rateLimit = new RateLimit(1, 3);

export async function GET() {
  const supabaseServer = await createClient();
  const user = (await supabaseServer.auth.getUser()).data.user;

  if (user === null) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'User not logged in',
      }),
    );
  }

  try {
    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  const supabase = await createClient();
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
  const session = await supabase.auth.getUser();

  if (session.data.user === null || session.error !== null) {
    return Response.json({
      success: false,
      error: 'User not logged in',
    });
  }

  const { error } = await adminAuthClient.deleteUser(session.data.user.id);

  if (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }

  return Response.json({ success: true });
}
