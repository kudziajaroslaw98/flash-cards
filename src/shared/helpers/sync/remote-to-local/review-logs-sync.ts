import { db } from '#/db/dexie.db';
import type { ReviewLog } from '#/types/review-log.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalReviewLogsSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('reviewLogs')
    .select(
      'frontUuid, timestamp, sessionUuid, cardFrontUuid, tags, synced, timeSpent, recalled',
    )
    .gt('timestamp', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.reviewLogs.bulkPut(data as ReviewLog[]);
  }
}
