'use client';
import { useAppContext } from '#/providers/app-context';
import type { Reminder } from '#/types/reminder.type';
import { useState } from 'react';
import { ReminderActions } from './reminder-actions';
import { ReminderFilters } from './reminder-filters';
import { RemindersList } from './reminders-list';

export function Reminders() {
  const [selected, setSelected] = useState<Reminder[]>([]);
  const [filtered, setFiltered] = useState<Reminder[]>([]);
  const { reminders } = useAppContext();

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='w-52 text-green-400'>Your Reminders</h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{reminders.length} reminders created</span>
          </span>
        </div>

        <ReminderFilters setFiltered={setFiltered} />
      </div>

      <RemindersList
        selected={selected}
        filtered={filtered}
        setSelected={setSelected}
      />

      <ReminderActions
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
