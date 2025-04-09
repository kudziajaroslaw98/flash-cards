'use client';

import { db } from '#/db/dexie.db';
import { cn } from '#/shared/utils/cn.util';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Dot } from 'lucide-react';
import { ReactNode } from 'react';
import Markdown from 'react-markdown';
import { Accordion } from '../_ui/accordion/accordion';
import Badge from '../_ui/badge/badge';
import LinkComponent from '../_ui/link/link';
import FlashcardComponent from '../flash-card/flash-card';

export function StudyPlan({ planId }: { planId: string }) {
  const planDays =
    useLiveQuery(
      () =>
        db.studyDays
          .where('planId')
          .equals(planId ?? '')
          .toArray(),
      [planId],
    ) ?? [];

  const studyPlan = useLiveQuery(() => db.studyPlans.get(planId), [planId]);
  const planSession = useLiveQuery(
    () =>
      db.studySessions
        .where('planId')
        .equals(planId ?? '')
        .first(),
    [planId],
  );

  const flashcards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];

  const PlanSection = ({
    title,
    text,
    children,
  }: {
    title?: string;
    text?: string;
    children?: ReactNode;
  }) => {
    return (
      <div className='flex w-full flex-col gap-2'>
        <span className='flex items-center gap-1 font-fredoka text-sm font-semibold uppercase'>
          <Dot className='size-4 text-green-500' />
          <span className='text-gray-600 dark:text-slate-200'>{title}</span>
        </span>

        {text && (
          <div className='prose w-full rounded-md bg-gray-100/60 p-2 px-5 text-sm text-gray-600 dark:bg-slate-900/60 dark:text-slate-300'>
            <Markdown>{text}</Markdown>
          </div>
        )}

        {children && (
          <div className='w-full rounded-md bg-gray-100/60 p-2 px-5 text-sm text-gray-600 dark:bg-slate-900/60 dark:text-slate-300'>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='flex w-full flex-col gap-8'>
      <div className='flex w-full flex-col justify-start gap-4'>
        <div className='flex w-full items-center justify-start gap-4'>
          <LinkComponent
            href='/study/plans'
            icon={
              <ArrowLeft className='h-4 w-4 transition group-hover:translate-x-2 group-active:translate-x-1' />
            }
            label='Back'
            className='group w-auto pb-4 text-green-400'
            underline={false}
          />
        </div>

        <span className='flex w-full flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400'>
          {studyPlan?.focusTags &&
            studyPlan?.focusTags.map((tag) => (
              <div key={`tag-${tag}`}>
                <span className='flex items-center'>
                  <Badge className='px-2 py-0 text-[.625rem]'>{tag}</Badge>
                </span>

                <span className='text-gray-200 last:hidden'>|</span>
              </div>
            ))}
        </span>

        <div className='flex justify-between'>
          <h4 className='line-clamp-2 flex w-full items-center gap-4 text-lg leading-6 tracking-tight text-green-400 md:text-xl 2xl:text-3xl'>
            {studyPlan?.name}
          </h4>
        </div>

        <div className='flex w-full flex-wrap items-center gap-3 text-sm leading-3 text-gray-500 dark:text-slate-400'>
          <span>current day {planSession?.currentDay}</span>

          <span className='text-gray-200'>|</span>

          <span>{studyPlan?.durationDays} days</span>

          <span className='text-gray-200'>|</span>

          <span>{studyPlan?.totalCards} cards</span>

          <span className='text-gray-200'>|</span>

          <span>
            created: {format(new Date(studyPlan?.createdAt ?? 0), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>

      <div>
        {planDays.length > 0 && (
          <Accordion className='w-full max-w-full'>
            {planDays.map((day, index) => (
              <Accordion.Item
                key={`day-${index}`}
                title={`Day ${index + 1}`}
              >
                <div className='flex w-full flex-col gap-4'>
                  <PlanSection title='Objectives'>
                    <ul className='prose flex list-disc flex-col gap-1 pl-4 text-sm'>
                      {day.objectives.map((objective, index) => (
                        <li key={'objective-' + index}>{objective}</li>
                      ))}
                    </ul>
                  </PlanSection>

                  <PlanSection title='Metrics'>
                    <ul className='prose flex list-disc flex-col gap-1 pl-4 text-sm'>
                      <li>Target Retention: {day.metrics.targetRetention}%</li>

                      <li>
                        Max Study Time: {day.metrics.maxStudyTime} minutes
                      </li>

                      <li>
                        Estimated study time required:{' '}
                        {day.metrics.estimatedStudyTime} minutes
                      </li>
                    </ul>
                  </PlanSection>

                  <div className='flex w-full flex-col gap-2'>
                    <div className='flex w-full flex-col gap-4'>
                      {day.cardsToReview.length > 0 && (
                        <PlanSection title='Review Cards'>
                          <div
                            className={cn([
                              'grid h-auto w-full justify-center gap-4 transition-all',
                              day.cardsToReview.length < 5
                                ? 'xl:justify-start'
                                : 'xl:justify-center',
                              'grid-cols-1 min-[600px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
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
                        </PlanSection>
                      )}

                      {day.newCards.length > 0 && (
                        <PlanSection title='New Cards'>
                          <div
                            className={cn([
                              'grid h-auto w-full justify-center gap-4 transition-all',
                              day.newCards.length < 5
                                ? 'xl:justify-start'
                                : 'xl:justify-center',
                              'grid-cols-1 min-[600px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                            ])}
                          >
                            {flashcards
                              .filter((card) =>
                                day.newCards.includes(card.frontUuid),
                              )
                              .map((card) => (
                                <FlashcardComponent
                                  key={'new-card-' + card.frontUuid}
                                  flashcard={card}
                                  size='horizontal-sm'
                                />
                              ))}
                          </div>
                        </PlanSection>
                      )}
                    </div>
                  </div>
                </div>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
