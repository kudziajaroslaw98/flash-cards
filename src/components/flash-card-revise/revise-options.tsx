import { cn } from '#/shared/utils/cn.util';
import type { FlashCard } from '#/types/flash-card.type';
import { useEffect, useState } from 'react';

type ReviseOptionsProps = {
  clicked: boolean;
  revisedCard: FlashCard | undefined;
  clickedOption: string | undefined;
  spaceRepetitionClick: (value: 'again' | 'hard' | 'good' | 'easy') => void;
  clickedCard: FlashCard | undefined;
  randomItems: FlashCard[] | null;
  changeClicked: (flashCard: FlashCard, key?: string) => void;
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
      value: 'again',
      label: 'Again',
      description: 'Show again in ~ 10 minutes',
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Show again in ~ 1 hour',
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Show again in ~ 1 day',
    },
    {
      value: 'easy',
      label: 'Easy',
      description: 'Show again in ~ 1 week',
    },
  ] as const;

  const [randomItemsOptions, setRandomItemsOptions] = useState<FlashCard[]>([]);

  useEffect(() => {
    if (!randomItems) return;
    const arrayCopy = [...randomItems];
    setRandomItemsOptions(arrayCopy.sort(() => Math.random() - 0.5));
  }, [randomItems]);

  return (
    <div className='mt-8 grid gap-2 xl:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
      {(revisedCard?.type === 'index' || revisedCard?.type === 'question') && (
        <>
          {spaceRepetitionOptions.map((option, index) => (
            <div
              className={cn([
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-slate-800/40 dark:hover:bg-slate-800',
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
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>

              <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                {option.label} - {option.description}
              </span>
            </div>
          ))}
        </>
      )}

      {revisedCard?.type === 'single' && randomItemsOptions !== null && (
        <>
          {randomItemsOptions.map((flashCard, index) => (
            <div
              className={cn([
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
                clicked &&
                  clickedCard?.frontUuid === flashCard.frontUuid &&
                  clickedCard?.frontUuid === revisedCard?.frontUuid &&
                  'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                clicked &&
                  clickedCard?.frontUuid === flashCard.frontUuid &&
                  clickedCard?.frontUuid !== revisedCard?.frontUuid &&
                  'border-red-400/50 bg-red-400/20 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
              ])}
              key={`answer-${index}`}
              onClick={() => changeClicked(flashCard)}
            >
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>

              <span className='flex w-[280px] text-sm text-gray-600 dark:text-slate-400'>
                {flashCard.answer}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
