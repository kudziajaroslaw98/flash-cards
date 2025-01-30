import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { useEffect, useState } from 'react';

type ReviseOptionsProps = {
  clicked: boolean;
  revisedCard: Flashcard | undefined;
  clickedOption: string | undefined;
  spaceRepetitionClick: (value: 'again' | 'hard' | 'good' | 'easy') => void;
  clickedCard: Flashcard | undefined;
  randomItems: Flashcard[] | null;
  changeClicked: (flashcard: Flashcard, key?: string) => void;
};

export function ReviseOptions({
  clicked,
  revisedCard,
  clickedOption,
  spaceRepetitionClick,
  clickedCard,
  randomItems,
  changeClicked,
}: ReviseOptionsProps) {
  const spaceRepetitionOptions = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Show again in ~ 1 week',
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Show again in ~ 1 day',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Show again in ~ 1 hour',
    },
    {
      value: 'again',
      label: 'Again',
      description: 'Show again in ~ 10 minutes',
    },
  ] as const;

  const [randomItemsOptions, setRandomItemsOptions] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (!randomItems) return;
    const arrayCopy = [...randomItems];
    setRandomItemsOptions(arrayCopy.sort(() => Math.random() - 0.5));
  }, [randomItems]);

  return (
    <div className='mt-8 grid w-full grid-cols-[repeat(1,1fr)] items-center justify-items-center gap-2 lg:w-auto lg:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
      {(revisedCard?.type === 'index' || revisedCard?.type === 'question') && (
        <>
          {spaceRepetitionOptions.map((option, index) => (
            <div
              className={cn([
                'flex w-full max-w-80 cursor-pointer items-center justify-center gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-slate-800/40 dark:hover:bg-slate-800',
                clickedOption === option.value &&
                  'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
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

      {revisedCard?.type === 'single' && randomItemsOptions !== null && (
        <>
          {randomItemsOptions.map((flashcard, index) => (
            <div
              className={cn([
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
                clicked &&
                  clickedCard?.frontUuid === flashcard.frontUuid &&
                  clickedCard?.frontUuid === revisedCard?.frontUuid &&
                  'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                clicked &&
                  clickedCard?.frontUuid === flashcard.frontUuid &&
                  clickedCard?.frontUuid !== revisedCard?.frontUuid &&
                  'border-red-400/50 bg-red-400/20 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
              ])}
              key={`answer-${index}`}
              onClick={() => changeClicked(flashcard)}
            >
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>

              <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                {flashcard.definition}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
