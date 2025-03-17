'use client';

import FlashcardComponent from '#/components/flash-card/flash-card';
import { db } from '#/db/dexie.db';
import { cn } from '#/shared/utils/cn.util';
import { useLiveQuery } from 'dexie-react-hooks';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';

export default function StudyPlanPage() {
  const [planId, setPlanId] = useState('');
  const params = new URL(window.location.href);

  useEffect(() => {
    setPlanId(params.searchParams.get('planId') as string);
  }, [params]);

  const planDays =
    useLiveQuery(
      () =>
        db.studyDays
          .where('planId')
          .equals(planId ?? '')
          .toArray(),
      [planId],
    ) ?? [];

  const flashcards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];

  return (
    <div>
      <h1>Study Plan</h1>
      <p>{planId}</p>
      <p>{planDays.length}</p>

      {planDays.map((day, index) => (
        <m.div
          key={`day-${index}`}
          className='flex w-full flex-col gap-2 pt-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className='text-xl text-green-400'>Day {day.dayNumber}</h4>

          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <h5 className='text-lg text-gray-600'>Objectives</h5>

              <ul className='flex list-disc flex-col gap-2 pl-4 text-sm'>
                {day.objectives.map((objective, index) => (
                  <li key={'objective-' + index}>{objective}</li>
                ))}
              </ul>
            </div>

            <div className='flex flex-col gap-2'>
              <h5 className='text-lg text-gray-600'>Metrics</h5>

              <ul className='flex list-disc flex-col gap-2 pl-4 text-sm'>
                <li>Target Retention: {day.metrics.targetRetention}%</li>

                <li>Max Study Time: {day.metrics.maxStudyTime} minutes</li>
              </ul>
            </div>

            <div className='flex w-full flex-col gap-2'>
              <h5 className='text-lg text-gray-600'>Assigned Cards</h5>

              <div className='flex w-full flex-col gap-4'>
                <div className='gap- flex flex-col gap-2'>
                  <h6 className='text-base text-gray-500'>Review Cards</h6>

                  <div
                    className={cn([
                      'grid h-auto w-full justify-center gap-4 transition-all',
                      day.cardsToReview.length < 5
                        ? 'xl:justify-start'
                        : 'xl:justify-center',
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
                    ])}
                  >
                    {flashcards
                      .filter((card) =>
                        day.cardsToReview.includes(card.frontUuid),
                      )
                      .map((card) => (
                        <FlashcardComponent
                          key={'review-card-' + card.frontUuid}
                          flashcard={card}
                          size='horizontal-sm'
                        />
                      ))}
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <h6 className='text-base text-gray-500'>New Cards</h6>

                  <div
                    className={cn([
                      'grid h-auto w-full justify-center gap-4 transition-all',
                      day.newCards.length < 5
                        ? 'xl:justify-start'
                        : 'xl:justify-center',
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
                    ])}
                  >
                    {flashcards
                      .filter((card) => day.newCards.includes(card.frontUuid))
                      .map((card) => (
                        <FlashcardComponent
                          key={'new-card-' + card.frontUuid}
                          flashcard={card}
                          size='horizontal-sm'
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}
