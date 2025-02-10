import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteDailyStatsSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncedStats = (await db.dailyStats.toArray())
    .filter((stat) => !stat.synced)
    .map((stat) => ({ ...stat, synced: true, user_uuid: user.id }));

  const { error: statsError } = await supabase
    .from('dailyStats')
    .upsert(unsyncedStats, { onConflict: 'frontUuid' });

  if (!statsError) {
    await db.dailyStats
      .where('frontUuid')
      .anyOf(unsyncedStats.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
