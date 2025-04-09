import { useEffect, useRef, useState, type RefObject } from 'react';
import ProgressBar from '../_ui/progress-bar/progress-bar';

export function ReviseSession({
  totalCards = 0,
  reviewed = 0,
  recalled = 0,
  timerStart,
}: {
  totalCards: number;
  reviewed: number;
  recalled: number;
  timerStart: RefObject<Date | null>;
}) {
  // eslint-disable-next-line no-undef
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [activeTime, setActiveTime] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      clearInterval(timerRef.current!);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerStart.current]);

  return (
    <div className='grid h-full w-full flex-col items-center justify-center gap-3'>
      <div className='flex items-center justify-start'>
        <h6 className='text-sm text-gray-600 dark:text-slate-200'>
          Session summary
        </h6>
      </div>

      <div className='flex flex-wrap justify-between gap-3 text-xs text-gray-600 dark:text-slate-400'>
        <span>
          <span>Total cards:</span>{' '}
          <span className='font-semibold'>{totalCards}</span>
        </span>

        <span>
          <span>Reviewed:</span>{' '}
          <span className='font-semibold'>{reviewed}</span>
        </span>

        <span>
          <span>Recalled:</span>{' '}
          <span className='font-semibold'>{recalled}</span>
        </span>

        <span className='flex gap-1'>
          <span>Time spent:</span>
          <span className='flex w-14 font-semibold'>
            {Math.floor(activeTime / 60)}m {activeTime % 60}s
          </span>
        </span>
      </div>

      <ProgressBar
        value={reviewed}
        max={totalCards}
      />
    </div>
  );
}
