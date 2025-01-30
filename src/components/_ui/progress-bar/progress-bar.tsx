import * as m from 'motion/react-m';

interface ProgressBarProps {
  value: number;
  max: number;
  showPercentage?: boolean;
}

const ProgressBar = ({ value, max }: ProgressBarProps) => {
  // Calculate percentage (clamped between 0 and 100)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className='flex h-2 w-full gap-2 rounded-full bg-gray-200 dark:bg-gray-700'>
      <m.div
        className='relative h-full w-full rounded-full bg-green-400'
        style={{ width: `${percentage}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      ></m.div>
    </div>
  );
};

export default ProgressBar;
