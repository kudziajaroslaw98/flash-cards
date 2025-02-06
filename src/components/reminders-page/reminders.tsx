'use client';
import { useAppContext } from '#/providers/app-context';
import type { Reminder } from '#/types/reminder.type';
import { useState } from 'react';
import { ReminderActions } from './reminder-actions';
import { RemindersHeadline } from './reminders-headline';
import { RemindersList } from './reminders-list';

export function Reminders() {
  const [selected, setSelected] = useState<Reminder[]>([]);
  const [filtered, setFiltered] = useState<Reminder[]>([]);
  const { reminders } = useAppContext();

  return (
    <div className='flex w-full flex-col gap-6'>
      <RemindersHeadline reminders={reminders} />

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
