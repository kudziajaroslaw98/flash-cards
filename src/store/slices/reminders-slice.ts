import { db } from '#/db/dexie.db';
import { defaultReminder } from '#/shared/defaults/default-reminder';
import { remindersMerge } from '#/shared/helpers/reminders-merge';
import { createClient } from '#/shared/utils/supabase/client';
import type { Reminder } from '#/types/reminder.type';
import type { StateCreator } from 'zustand';
import type { AppState, RemindersSlice } from '../app-state';

export const createRemindersSlice: StateCreator<
  AppState,
  [],
  [],
  RemindersSlice
> = (_set, get) => ({
  // Actions
  addReminders: async (reminders) => {
    const supabase = createClient();
    const { user } = get();

    const mappedReminders: Reminder[] = reminders.map((reminder) =>
      remindersMerge(defaultReminder, reminder)
    );

    await db.reminders.bulkAdd(mappedReminders);

    const bulkReminders = await db.reminders.bulkGet(
      mappedReminders.map((item) => item.frontUuid)
    );

    await supabase.from('reminders').insert(
      bulkReminders.map((item) => ({
        ...item,
        user_uuid: user?.id,
      }))
    );
  },

  removeReminders: async (reminders) => {
    const supabase = createClient();

    const remindersToDelete: string[] = reminders.map(
      (item) => item.frontUuid
    );

    await db.reminders.bulkDelete(remindersToDelete);

    await supabase
      .from('reminders')
      .delete()
      .in('frontUuid', remindersToDelete);
  },

  updateReminders: async (reminders) => {
    const supabase = createClient();

    const mappedReminders: Reminder[] = reminders.map((reminder) =>
      remindersMerge(defaultReminder, reminder)
    );

    await db.reminders.bulkPut(mappedReminders);

    await Promise.all(
      mappedReminders.map((reminder) =>
        supabase
          .from('reminders')
          .update(reminder)
          .eq('frontUuid', reminder.frontUuid)
      )
    );
  },
});
