import { FlashCardModel } from '#/shared/models/flash-card.model';
import { PropsWithChildren } from 'react';

interface FlashCardRowProps {
  index: number;
  flashCard: FlashCardModel;
}

export const FlashCardRowComponent = (
  props: PropsWithChildren<FlashCardRowProps>,
) => {
  return (
    <div
      key={props.flashCard.frontUuid}
      className={`flex rounded-md border border-transparent bg-gray-100 shadow-table-row transition-all dark:bg-slate-600 dark:text-slate-200`}
    >
      <div className='flex min-w-12 cursor-pointer items-center justify-center border-r border-r-slate-400/20 p-2 text-sm'>
        {props.index + 1}
      </div>

      <div className='flex w-full min-w-44 flex-col items-start gap-2 p-2 py-4 text-sm md:w-auto md:flex-row md:items-center md:border-r md:border-r-slate-400/20 md:py-2'>
        <div
          className={`w-full rounded-md border-transparent bg-gray-100 p-2 text-base font-semibold outline-none ring-blue-400 transition-all focus:ring-1 dark:bg-slate-600 md:text-sm`}
        >
          {props.flashCard.word}
        </div>

        <div
          className={`h-20 w-full resize-none rounded-md border-transparent bg-gray-100 p-2 outline-none ring-blue-400 transition-all focus:ring-1 dark:bg-slate-600 md:hidden`}
        >
          {props.flashCard.definition}
        </div>
      </div>

      <div className='line-clamp-2 hidden w-full items-center p-2 px-4 text-sm md:flex'>
        <div
          className={`hidden w-full resize-none rounded-md border-transparent bg-gray-100 p-2 outline-none ring-blue-400 transition-all focus:ring-1 dark:bg-slate-600 md:flex md:h-10`}
        >
          {props.flashCard.definition}
        </div>
      </div>
    </div>
  );
};
