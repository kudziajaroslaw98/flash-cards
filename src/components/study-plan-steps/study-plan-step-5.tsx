import { db } from '#/db/dexie.db';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import type { Flashcard } from '#/types/flash-card.type';
import { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Check, Dot, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { z } from 'zod';
import { Accordion } from '../_ui/accordion/accordion';
import { Button } from '../_ui/button/button';
import FlashcardComponent from '../flash-card/flash-card';
import { FloatingButtons } from '../floating-buttons/floating-buttons';

export function StudyPlanStep5({
  focusTags,
  flashcards,
  summaries,
  planType,
  duration,
}: {
  focusTags: string[];
  flashcards: Flashcard[];
  summaries: Partial<{
    frontUuid: string;
    context: string;
    query: string;
    definition: string;
  }>[];
  planType: string;
  duration: string;
}) {
  const [planDays, setPlanDays] = useState<(StudyDay & { name: string })[]>([]);
  const initialLoadReg = useRef<boolean>(false);
  const router = useRouter();
  const { submit, isLoading, object } = useObject({
    api: API_ROUTES.GENERATE_PLAN,
    schema: z.array(
      z.object({
        dayNumber: z.number(),
        objectives: z.array(z.string()),
        name: z.string(),
        cardsToReview: z
          .array(z.string())
          .describe('Array of flashcards frontUuids'),
        newCards: z
          .array(z.string())
          .describe('Array of flashcards frontUuids'),
        metrics: z.object({
          targetRetention: z.number(),
          maxStudyTime: z.number(),
          estimatedStudyTime: z.number(),
        }),
      }),
    ),
  });

  useEffect(() => {
    if (summaries && planType && duration && initialLoadReg.current === false) {
      initialLoadReg.current = true;
      submit({
        summaries,
        planType,
        duration,
      });
    }
  }, []);

  useEffect(() => {
    if (!object) return;
    setPlanDays(
      object?.filter((plan) => plan) as (StudyDay & { name: string })[],
    );
    const uniqueFlashcards = new Set<string>();
    object.forEach((day) => {
      day?.newCards?.map((card) => uniqueFlashcards.add(card as string));
      day?.cardsToReview?.map((card) => uniqueFlashcards.add(card as string));
    });
    console.log('usedUniqueFlashcards', uniqueFlashcards);
  }, [object]);

  const handleAcceptPlan = () => {
    const planId = uuid();
    const sessionId = uuid();
    const dateNow = new Date().toUTCString();

    const studyPlan: StudyPlan = {
      frontUuid: planId,
      durationDays: parseInt(duration),
      name: planDays[planDays.length - 1].name,
      days: planDays,
      focusTags: focusTags,
      totalCards: flashcards.length,
      createdAt: dateNow,
      updatedAt: dateNow,
      synced: false,
    };

    const session: StudySession = {
      frontUuid: sessionId,
      planId,
      synced: false,
      currentDay: 1,
      stage: 3,
      startDate: new Date().toUTCString(),
      nextRevisionDate: new Date().toUTCString(),
      correctCards: [],
      incorrectCards: [],
      completedCards: [],
      createdAt: dateNow,
      updatedAt: dateNow,
    };

    const studyPlanDays: StudyDay[] = planDays.map((day) => {
      const frontUuid = uuid();

      return {
        frontUuid,
        planId,
        dayNumber: day.dayNumber,
        objectives: day.objectives,
        cardsToReview: day.cardsToReview,
        newCards: day.newCards,
        correctCards: [],
        incorrectCards: [],
        metrics: {
          targetRetention: day.metrics.targetRetention,
          estimatedStudyTime: day.metrics.estimatedStudyTime,
          maxStudyTime: day.metrics.maxStudyTime,
        },
        synced: false,
        createdAt: dateNow,
        updatedAt: dateNow,
      };
    });

    db.studyPlans.add(studyPlan);
    db.studySessions.add(session);
    db.studyDays.bulkAdd(studyPlanDays);

    router.push(`/study/plans/`);
  };

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
        <span className='flex items-center gap-1 font-serif text-sm font-semibold uppercase'>
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
    <div className='flex w-full flex-col items-start'>
      <div className='flex w-full flex-col items-center justify-center py-4'>
        <div className='flex w-full max-w-2xl flex-col justify-center px-4'>
          <h2 className='mb-4 text-xl font-bold text-gray-700 dark:text-slate-400'>
            Get Your Personalized Study Plan
          </h2>

          <span className='text-justify text-sm text-gray-500'>
            Review Your Study Plan - Ready to Learn!
          </span>
        </div>
      </div>

      <div className='flex w-full flex-col items-center justify-center py-4'>
        <div className='flex w-96 flex-col justify-center px-4 py-4 lg:w-[28rem] '>
          {isLoading && (
            <div className='flex w-full flex-col items-center justify-center gap-4'>
              <LoaderCircle className='size-6 animate-spin' />
              <span className='flex w-full animate-pulse justify-center py-4 text-center text-lg md:text-left'>
                Generating personalized plan...
              </span>
            </div>
          )}

          {!isLoading && (
            <div className='flex w-full flex-col items-center justify-center gap-4'>
              <span className='flex w-full flex-col justify-center text-center text-sm'>
                <span>Your personalized plan is ready.</span>

                <span>
                  You can look at it below. Accept whenever you are ready.
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

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

                    <li>Max Study Time: {day.metrics.maxStudyTime} minutes</li>

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

      {!isLoading && (
        <FloatingButtons>
          <Button
            alt='Accept Plan'
            onClick={handleAcceptPlan}
            label='Accept Plan'
            icon={<Check className='size-4' />}
            iconPosition='right'
            disabled={isLoading}
          />
        </FloatingButtons>
      )}
    </div>
  );
}
