import { SupabaseClient } from "@supabase/supabase-js";

const isLoggedIn = async (client: SupabaseClient) => {
    return await client.auth.getUser() !== null;
}

export { isLoggedIn }