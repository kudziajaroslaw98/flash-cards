import { db } from '#/db/dexie.db';
import type { DailyStat } from '#/types/daily-stat.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalDailyStatsSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('dailyStats')
    .select(
      'updatedAt, frontUuid, date, retention, cardsReviewed, cardsRecalled, timeSpent, synced',
    )
    .gt('updatedAt', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.dailyStats.bulkPut(data as DailyStat[]);
  }
}
