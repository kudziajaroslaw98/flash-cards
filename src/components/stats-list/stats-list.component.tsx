'use client';

import CardComponent from '#/components/ui/card/card.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_STATS } from '#/utils/defaults/stats.default';
import { StatsModel } from '#/utils/interfaces/stats.model';
import { Stats } from '#/utils/types/local-storage-stats.type';

export default function StatsListComponent() {
  const { value: statistics } = useLocalStorage<
    StatsModel[keyof StatsModel],
    Stats
  >('stats', DEFAULT_STATS);

  return (
    <div className='flex h-full w-full items-start justify-center pt-24'>
      {/*<div className='grid max-w-2xl auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3'>*/}
      <div className='flex max-w-2xl flex-wrap justify-center gap-4'>
        <CardComponent
          backgroundGradientWidth={100}
          class='min-h-44 w-full max-w-44 flex-col items-center justify-center gap-4'
        >
          <h2 className='text-5xl font-bold text-green-400 dark:text-green-500'>
            {statistics.answers}
          </h2>

          <h4 className='w-full text-center font-semibold text-gray-600 dark:text-slate-200'>
            Answers
          </h4>
        </CardComponent>

        <CardComponent
          backgroundGradientWidth={100}
          class='min-h-44 w-full  max-w-44 flex-col items-center justify-center gap-4'
        >
          <h2 className='text-5xl font-bold text-green-400 dark:text-green-500'>
            {statistics.correctAnswers}
          </h2>

          <h4 className='w-full text-center font-semibold text-gray-600 dark:text-slate-200'>
            Correct answers
          </h4>
        </CardComponent>

        <CardComponent
          backgroundGradientWidth={100}
          class='min-h-44 w-full max-w-44 flex-col items-center justify-center gap-4'
        >
          <h2 className='text-5xl font-bold text-green-400 dark:text-green-500'>
            {statistics.incorrectAnswers}
          </h2>

          <h4 className='w-full text-center font-semibold text-gray-600 dark:text-slate-200'>
            Incorrect answers
          </h4>
        </CardComponent>

        <CardComponent
          backgroundGradientWidth={100}
          class='min-h-44 w-full max-w-44 flex-col items-center justify-center gap-4'
        >
          <h2 className='text-5xl font-bold text-green-400 dark:text-green-500'>
            {statistics.createdFlashCards}
          </h2>

          <h4 className='w-full text-center font-semibold text-gray-600 dark:text-slate-200'>
            Created <br />
            Flash Cards
          </h4>
        </CardComponent>

        <CardComponent
          backgroundGradientWidth={100}
          class='min-h-44 w-full max-w-44 flex-col items-center justify-center gap-4'
        >
          <h2 className='text-5xl font-bold text-green-400 dark:text-green-500'>
            {statistics.accuracy * 100}%
          </h2>

          <h4 className='w-full text-center font-semibold text-gray-600 dark:text-slate-200'>
            Accuracy
          </h4>
        </CardComponent>
      </div>
    </div>
  );
}
