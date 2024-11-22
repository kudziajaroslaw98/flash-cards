import { createClient } from '#/shared/utils/supabase/server';
import { createClient as createClientSupabase } from '@supabase/supabase-js'


export async function GET() {
    const supabase = await createClient();
    const supabaseAdmin = createClientSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const adminAuthClient = supabaseAdmin.auth.admin
    const session = await supabase.auth.getUser();

    if (session.data.user === null || session.error !== null) {
        return Response.json({
            success: false,
            error: 'User not logged in',
        })
    }

    const { error } = await adminAuthClient.deleteUser(session.data.user.id);

    if (error) {
        return Response.json({
            success: false,
            error: error.message,
        })
    }

    return Response.json({ success: true });
}
