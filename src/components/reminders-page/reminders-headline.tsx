import type { Reminder } from '#/types/reminder.type';
import { ReminderFilters } from './reminder-filters';

export function RemindersHeadline({ reminders }: { reminders: Reminder[] }) {
  return (
    <div className='flex w-full flex-col justify-between gap-2'>
      <h4 className='w-52 text-green-400'>Your Reminders</h4>
      <span className='flex w-full flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400'>
        <span>{reminders.length} reminders created</span>
      </span>

      <ReminderFilters />
    </div>
  );
}
