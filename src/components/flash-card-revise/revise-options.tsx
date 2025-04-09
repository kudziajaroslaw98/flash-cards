import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';

type ReviseOptionsProps = {
  clicked: boolean;
  revisedCard: Flashcard | undefined;
  clickedOption: string | undefined;
  spaceRepetitionClick: (value: 'again' | 'hard' | 'good' | 'easy') => void;
  changeClicked: (answer: string, key?: string) => void;
  clickedAnswer?: string;
  answersAvailable?: boolean;
  answers?: string[];
};

export function ReviseOptions({
  clicked,
  revisedCard,
  clickedOption,
  clickedAnswer,
  spaceRepetitionClick,
  changeClicked,
  answersAvailable = false,
  answers = [],
}: ReviseOptionsProps) {
  const spaceRepetitionOptions = [
    {
      value: 'again',
      label: 'Again',
      description: 'Resetting card',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Review sooner',
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Review on schedule',
    },
    {
      value: 'easy',
      label: 'Easy',
      description: 'Review later',
    },
  ] as const;

  return (
    <div className='mt-8 grid w-full grid-cols-[repeat(1,1fr)] items-stretch justify-items-center gap-2 lg:w-auto lg:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
      {revisedCard && !answersAvailable && (
        <>
          {spaceRepetitionOptions.map((option, index) => (
            <div
              className={cn([
                'flex w-full max-w-80 cursor-pointer items-center justify-center gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-slate-800/40 dark:hover:bg-slate-800',
                clickedOption === option.value &&
                  'scale-110 border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                clicked &&
                  clickedOption !== option.value &&
                  'scale-95 opacity-25 blur-[2px]',
              ])}
              key={`answer-${index}`}
              onClick={() =>
                spaceRepetitionClick(
                  option.value as 'again' | 'hard' | 'good' | 'easy',
                )
              }
            >
              <span
                className={cn([
                  'flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md text-gray-100 dark:text-slate-900',
                  option.value === 'easy' && 'bg-green-400',
                  option.value === 'good' && 'bg-blue-400',
                  option.value === 'hard' && 'bg-orange-400',
                  option.value === 'again' && 'bg-red-400',
                ])}
              >
                {index + 1}
              </span>

              <span className='flex w-full  flex-col text-sm text-gray-600 dark:text-slate-400'>
                <span
                  className={cn([
                    'font-semibold',
                    option.value === 'easy' && 'text-green-400',
                    option.value === 'good' && 'text-blue-400',
                    option.value === 'hard' && 'text-orange-400',
                    option.value === 'again' && 'text-red-400',
                  ])}
                >
                  {option.label}
                </span>
                <span className='text-xs'>{option.description}</span>
              </span>
            </div>
          ))}
        </>
      )}

      {revisedCard && answersAvailable && (
        <>
          {answers.map((answer, index) => (
            <div
              className={cn([
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
                clicked &&
                  answer === revisedCard.answer1 &&
                  clickedAnswer === answer &&
                  'scale-110 border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                clicked &&
                  answer !== revisedCard.answer1 &&
                  clickedAnswer === answer &&
                  'scale-110 border-red-400/50 bg-red-400/20 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
                clicked &&
                  clickedAnswer !== answer &&
                  'scale-95 opacity-25 blur-[2px]',
              ])}
              key={`answer-${index + 1}`}
              onClick={() => {
                changeClicked(answer);
              }}
            >
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>

              <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                {answer}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
