import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteReviewLogsSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncedLogs = (await db.reviewLogs.toArray())
    .filter((log) => !log.synced)
    .map((log) => ({ ...log, synced: true, user_uuid: user.id }));

  const { error: setError } = await supabase
    .from('reviewLogs')
    .upsert(unsyncedLogs, { onConflict: 'frontUuid' });

  if (!setError) {
    await db.reviewLogs
      .where('frontUuid')
      .anyOf(unsyncedLogs.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
