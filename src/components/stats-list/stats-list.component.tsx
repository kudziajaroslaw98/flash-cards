'use client';

import CardComponent from '#/components/ui/card/card.component';
import { useAppSelector } from '#/hooks/store-hooks.hook';
import { Stats } from '#/shared/types/local-storage-stats.type';
import { statsSelectors } from '#/store/selectors/stats.selectors';

export default function StatsListComponent() {
  const statistics = useAppSelector(statsSelectors.selectStats);

  const labels: Record<keyof Stats, string> = {
    answers: 'Answers',
    correctAnswers: 'Correct answers',
    incorrectAnswers: 'Incorrect answers',
    createdFlashCards: 'Created Flash Cards',
    accuracy: 'Accuracy',
  };

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-8'>
      <h4 className='text-green-400'>Your statistics</h4>

      <div className='flex max-w-2xl flex-wrap justify-center gap-4'>
        {Object.entries(statistics)?.map(([key, value]) => (
          <CardComponent
            key={key}
            backgroundGradientWidth={100}
            class='w-full max-w-80 items-center justify-between sm:min-h-44 sm:max-w-44 sm:flex-col sm:gap-4'
          >
            <h1 className='w-36 text-green-400 sm:w-auto dark:text-green-500'>
              {key !== 'accuracy' ? value : (value * 100).toFixed(0) + '%'}
            </h1>

            <p className='grow font-semibold text-gray-600 sm:w-full sm:text-center dark:text-slate-200'>
              {labels[key as keyof Stats]}
            </p>
          </CardComponent>
        ))}
      </div>
    </div>
  );
}
