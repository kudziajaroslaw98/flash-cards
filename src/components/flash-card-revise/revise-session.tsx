import ProgressBar from '../_ui/progress-bar/progress-bar';

export function ReviseSession({
  totalCards = 0,
  reviewed = 0,
  recalled = 0,
  timeSpent = 0,
}: {
  totalCards: number;
  reviewed: number;
  recalled: number;
  timeSpent: number;
}) {
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
            {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
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
