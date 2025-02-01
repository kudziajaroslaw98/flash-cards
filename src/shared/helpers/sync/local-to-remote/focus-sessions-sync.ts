import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteFocusSessionsSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncedSessions = (await db.focusSessions.toArray())
    .filter((session) => !session.synced)
    .map((session) => ({ ...session, synced: true, user_uuid: user.id }));

  const { error: setError } = await supabase
    .from('focusSessions')
    .upsert(unsyncedSessions, { onConflict: 'frontUuid' });

  if (!setError) {
    await db.focusSessions
      .where('frontUuid')
      .anyOf(unsyncedSessions.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
