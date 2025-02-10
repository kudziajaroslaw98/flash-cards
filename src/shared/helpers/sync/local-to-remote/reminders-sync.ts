import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteRemindersSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncReminders = (await db.reminders.toArray())
    .filter((stat) => !stat.synced)
    .map((stat) => ({ ...stat, synced: true, user_uuid: user.id }));

  const { error: remindersError } = await supabase
    .from('reminders')
    .upsert(unsyncReminders, { onConflict: 'frontUuid' });

  if (!remindersError) {
    await db.reminders
      .where('frontUuid')
      .anyOf(unsyncReminders.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
