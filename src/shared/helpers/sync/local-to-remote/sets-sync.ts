import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteSetsSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncedSets = (await db.sets.toArray())
    .filter((set) => !set.synced)
    .map((set) => ({ ...set, synced: true, user_uuid: user.id }));

  const { error: setError } = await supabase
    .from('sets')
    .upsert(unsyncedSets, { onConflict: 'frontUuid' });

  if (!setError) {
    await db.sets
      .where('frontUuid')
      .anyOf(unsyncedSets.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
