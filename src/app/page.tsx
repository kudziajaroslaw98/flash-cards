import { supabaseClient } from '#/utils/functions/supabase-client';

export default async function Home() {
  const supabase = supabaseClient();
  return <h2>Home</h2>;
}
