'use client';

import { useAppContext } from '#/providers/app-context';
import CardComponent from '#/components/_ui/card/card';
import type { Metadata } from '#/types/metadata.type';

export default function StatsListComponent() {
  const { metadata } = useAppContext();

  const labels: Record<keyof Omit<Metadata, 'theme'>, string> = {
    answers: 'Answers',
    correctAnswers: 'Correct answers',
    incorrectAnswers: 'Incorrect answers',
    createdFlashCards: 'Created Flash Cards',
    accuracy: 'Accuracy',
    streak: 'Streak',
    lastSyncAt: 'Last sync at',
  };

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-8'>
      <h4 className='text-green-400'>Your statistics</h4>

      <div className='flex max-w-2xl flex-wrap justify-center gap-4'>
        {Object.entries({
          ...metadata,
          lastSyncAt: 'soon',
          streak: 'soon',
        })?.map(([key, value]) => (
          <CardComponent
            key={key}
            backgroundGradientWidth={100}
            className='w-full max-w-80 items-center justify-between sm:min-h-44 sm:max-w-44 sm:flex-col sm:gap-4'
          >
            <span className='flex h-16 w-36 items-center justify-center text-4xl font-bold text-green-400 dark:text-green-500 sm:w-auto'>
              {key !== 'accuracy'
                ? `${value}`
                : `${((value as number) * 100).toFixed(0)}%`}
            </span>

            <p className='grow font-semibold text-gray-600 dark:text-slate-200 sm:w-full sm:text-center'>
              {labels[key as keyof Omit<Metadata, 'theme'>]}
            </p>
          </CardComponent>
        ))}
      </div>
    </div>
  );
}
