import { db } from '#/db/dexie.db';
import type { Reminder } from '#/types/reminder.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalRemindersSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('reminders')
    .select(
      'frontUuid, title, start, repeat, enabled, synced, createdAt, updatedAt',
    )
    .gt('updatedAt', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.reminders.bulkPut(data as Reminder[]);
  }
}
