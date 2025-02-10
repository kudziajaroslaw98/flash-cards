import { db } from '#/db/dexie.db';
import type { FocusSession } from '#/types/focus-session.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalFocusSessionsSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('focusSessions')
    .select(
      'frontUuid, timestamp, synced, start, end, activeTime, distractions',
    )
    .gt('timestamp', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.focusSessions.bulkPut(data as FocusSession[]);
  }
}
