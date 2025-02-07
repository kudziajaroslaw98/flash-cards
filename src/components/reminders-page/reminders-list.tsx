import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { Reminder } from '#/types/reminder.type';
import { CalendarClock } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { ReminderCard } from './reminder-card';

export function RemindersList({
  selected,
  filtered,
  setSelected,
}: {
  selected: Reminder[];
  filtered: Reminder[];
  setSelected: React.Dispatch<React.SetStateAction<Reminder[]>>;
}) {
  const { reminders } = useAppContext();
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const isSelected = useCallback(
    (reminder: Reminder) => {
      return (
        selected.findIndex((item) => item.frontUuid === reminder.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (reminder: Reminder) => {
      if (isSelected(reminder)) {
        setSelected((prev) =>
          prev.filter((item) => reminder.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, reminder]);
      }
    },
    [isSelected],
  );

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  return (
    <div className='relative flex h-full w-full flex-col'>
      {reminders.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10 text-center'>
          <CalendarClock className='mb-8 size-12 text-green-500' />
          <span>
            Your schedule is so clear, it&apos;s making the calendar jealous.
          </span>
          <span>Add a reminder!</span>
        </div>
      )}
      {reminders.length > 0 && (
        <AnimatePresence mode='popLayout'>
          <div
            className={cn([
              'grid h-auto w-full justify-center gap-4 transition-all',
              'grid-cols-[repeat(auto-fit,minmax(10rem,20rem))]',
              'sm:grid-cols-[repeat(auto-fit,minmax(10rem,14rem))]',
              'xl:grid-cols-[repeat(4,minmax(10rem,1fr))]',
              filtered.length > 5 ? 'xl:justify-between' : 'xl:justify-start',
            ])}
          >
            {filtered.map((reminder) => (
              <ReminderCard
                key={'reminder-' + reminder.frontUuid}
                reminder={reminder}
                isSelected={isSelected(reminder)}
                onSelect={() => toggleSelected(reminder)}
                isInSelectionMode={isInSelectionMode}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
