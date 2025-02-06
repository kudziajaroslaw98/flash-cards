import type { Reminder } from '#/types/reminder.type';
import { ReminderFilters } from './reminder-filters';

export function RemindersHeadline({ reminders }: { reminders: Reminder[] }) {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
      <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
        <h4 className='w-52 text-green-400'>Your Reminders</h4>
        <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
          <span>{reminders.length} reminders created</span>
        </span>
      </div>

      <ReminderFilters />
    </div>
  );
}
