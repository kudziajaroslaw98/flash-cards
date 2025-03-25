import useLongPress from '#/hooks/use-long-press.hook';
import { cn } from '#/shared/utils/cn.util';
import type { Reminder } from '#/types/reminder.type';
import { format } from 'date-fns';
import { BadgeCheck, Calendar, CircleSlash, Repeat } from 'lucide-react';
import * as m from 'motion/react-m';
import Card from '../_ui/card/card';

interface ReminderCardProps {
  reminder: Reminder;
  isSelected?: boolean;
  onSelect?: (reminder: Reminder) => void;
  isInSelectionMode?: boolean;
}

export function ReminderCard({
  isSelected,
  reminder,
  onSelect,
  isInSelectionMode,
  ...props
}: ReminderCardProps) {
  const [onStart, onEnd, onMove] = useLongPress<Reminder>(
    (flashcard) => {
      window?.umami?.track('Flashcard long pressed');
      if (onSelect) {
        onSelect(flashcard);
      }
    },
    () => {
      window?.umami?.track('Flashcard short pressed');
      if (isInSelectionMode) {
        window?.umami?.track('Flashcard selected');
        if (onSelect) {
          onSelect(reminder);
        }
      }
    },
  );

  const getRepeatFromCode = (code: string) => {
    switch (code) {
      case 'none':
        return 'No repeat';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return 'No repeat';
    }
  };

  return (
    <m.div
      onMouseDown={(e) => onStart(e, reminder)}
      onMouseUp={onEnd}
      onTouchStart={(e) => onStart(e, reminder)}
      onTouchEnd={onEnd}
      onTouchMove={onMove}
    >
      <m.div
        layout
        animate={{
          translateY: '0%',
          opacity: 100,
          zIndex: 21,
          maxHeight: '100%',
          height: '100%',
        }}
        initial={{ translateY: '10%', opacity: 0, zIndex: -20 }}
        exit={{
          translateY: '-5%',
          opacity: 0,
          zIndex: -20,
          maxHeight: 0,
          height: 0,
        }}
        className='flex justify-center'
        key={`reminder-card-${reminder.frontUuid}`}
      >
        <Card
          tabIndex={0}
          className={cn([
            'z-10 h-full w-full cursor-pointer flex-col items-center gap-4 p-4 outline-none transition focus-visible:ring focus-visible:ring-green-400/50',
            isSelected ? 'ring ring-green-400/60' : '',
            !reminder.enabled &&
              isSelected &&
              'scale-100 opacity-100 blur-[0px]',
            !reminder.enabled &&
              !isSelected &&
              'scale-95 opacity-75 blur-[1px]',
          ])}
          {...props}
        >
          {isSelected && (
            <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6 fill-green-500 text-gray-50 dark:text-slate-950' />
          )}
          <div className='flex h-full w-full flex-col justify-between'>
            <div className='flex items-center gap-4 '>
              <span
                className={cn([
                  'text-5xl font-bold text-green-500',
                  !reminder.enabled && 'text-gray-200 dark:text-slate-900',
                ])}
              >
                {new Date(reminder.start)
                  .getHours()
                  .toString()
                  .padStart(2, '0')}{' '}
                :{' '}
                {new Date(reminder.start)
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}
              </span>
            </div>
            <h5
              className={cn([
                'mt-1 text-base font-bold text-gray-800 dark:text-slate-200',
                !reminder.enabled && 'text-gray-400 dark:text-slate-700',
              ])}
            >
              {reminder.title === ''
                ? 'No title'
                : reminder.title.charAt(0).toUpperCase() +
                  reminder.title.slice(1)}
            </h5>
            <span
              className={cn([
                'mt-4 flex items-center gap-2 text-sm font-semibold leading-5 text-gray-500',
                !reminder.enabled && 'text-gray-300 dark:text-slate-900',
              ])}
            >
              <span
                className={cn([
                  'text-green-500',
                  !reminder.enabled && 'text-gray-300 dark:text-slate-900',
                ])}
              >
                {reminder.repeat === 'none' ? (
                  <CircleSlash className='size-4' />
                ) : (
                  <Repeat className='size-4' />
                )}
              </span>
              <span>{getRepeatFromCode(reminder.repeat)}</span>
            </span>
            <span
              className={cn([
                'mt-1 flex items-center gap-2 text-sm font-semibold leading-5 text-gray-500',
                !reminder.enabled && 'text-gray-300 dark:text-slate-900',
              ])}
            >
              <Calendar
                className={cn([
                  'size-4 text-green-500',
                  !reminder.enabled && 'text-gray-300 dark:text-slate-900',
                ])}
              />
              <span>
                <span>
                  {format(new Date(reminder.start), 'yyyy-MM-dd HH:mm')}
                </span>
              </span>
            </span>
          </div>
        </Card>
      </m.div>
    </m.div>
  );
}
