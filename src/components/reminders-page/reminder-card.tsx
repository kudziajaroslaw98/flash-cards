import useLongPress from '#/hooks/use-long-press.hook';
import { cn } from '#/shared/utils/cn.util';
import type { Reminder } from '#/types/reminder.type';
import { BadgeCheck } from 'lucide-react';
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
      window.umami.track('Flashcard long pressed');
      if (onSelect) {
        onSelect(flashcard);
      }
    },
    () => {
      window.umami.track('Flashcard short pressed');
      if (isInSelectionMode) {
        window.umami.track('Flashcard selected');
        if (onSelect) {
          onSelect(reminder);
        }
      }
    },
  );

  return (
    <m.div
      onMouseDown={(e) => onStart(e, reminder)}
      onMouseUp={onEnd}
      onTouchStart={(e) => onStart(e, reminder)}
      onTouchEnd={onEnd}
      onTouchMove={onMove}
    >
      <m.div
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
            'z-10 cursor-pointer flex-col items-center p-4 py-0 outline-none focus-visible:ring  focus-visible:ring-green-400/50',
            isSelected ? 'ring ring-green-400/60' : '',
          ])}
          {...props}
        >
          <span className={cn(['flex h-full w-full flex-col'])}>
            <>
              {isSelected && (
                <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6 fill-green-500 text-gray-50 dark:text-slate-950' />
              )}
              <h5>Reminder</h5>
              <p className='text-gray-500 dark:text-slate-400'>
                {reminder.title}
              </p>
            </>
          </span>
        </Card>
      </m.div>
    </m.div>
  );
}
