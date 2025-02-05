'use client';
import type { Reminder } from '#/types/reminder.type';
import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { ReminderActions } from './reminder-actions';
import { RemindersHeadline } from './reminders-headline';

export function Reminders() {
  const [reminders] = useState<Reminder[]>([]);
  return (
    <div className='flex w-full flex-col gap-6'>
      <RemindersHeadline reminders={reminders} />
      {reminders.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10'>
          <CalendarClock className='mb-8 size-12 text-green-500' />
          <span>
            Your schedule is so clear, it&apos;s making the calendar jealous.
          </span>
          <span>Add a reminder!</span>
        </div>
      )}
      <ReminderActions />
    </div>
  );
}
