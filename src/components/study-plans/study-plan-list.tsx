import { db } from '#/db/dexie.db';
import useLongPress from '#/hooks/use-long-press.hook';
import { cn } from '#/shared/utils/cn.util';
import type { StudyPlan } from '#/types/study-plan.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { BadgeCheck, Palette } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Badge from '../_ui/badge/badge';
import Card from '../_ui/card/card';

export function StudyPlanList({
  filteredPlans,
  selected,
  setSelected,
}: {
  filteredPlans: StudyPlan[];
  selected: StudyPlan[];
  setSelected: Dispatch<SetStateAction<StudyPlan[]>>;
}) {
  const router = useRouter();
  const studyPlans =
    useLiveQuery(() => db.studyPlans.toCollection().sortBy('createdAt')) ?? [];
  const studySessions = useLiveQuery(() => db.studySessions.toArray()) ?? [];
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const [onStart, onEnd, onMove] = useLongPress<StudyPlan, StudyPlan>(
    (plan) => {
      window?.umami?.track('Flashcard long pressed');
      toggleSelected(plan);
    },
    ([plan]) => {
      window?.umami?.track('Flashcard short pressed');
      if (isInSelectionMode) {
        window?.umami?.track('Flashcard selected');
        toggleSelected(plan);
      } else {
        window?.umami?.track('Flashcard clicked');
        router.push(`/study/plans/${plan.frontUuid}/`);
      }
    },
  );

  const isSelected = useCallback(
    (plan: StudyPlan) => {
      return (
        selected.findIndex((item) => item.frontUuid === plan.frontUuid) !== -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (plan: StudyPlan) => {
      if (isSelected(plan)) {
        setSelected((prev) =>
          prev.filter((item) => item.frontUuid !== plan.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, plan]);
      }
    },
    [isSelected],
  );

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  return (
    <div className='relative flex h-full w-full flex-col'>
      {studyPlans.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10'>
          <Palette className='mb-8 size-12 text-green-500' />
          <span>Your syllabus is cosplaying as a white canvas.</span>
          <span>Picasso would cry.</span>
        </div>
      )}
      {studyPlans.length > 0 && (
        <div className='mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4 lg:grid-cols-[repeat(2,minmax(20rem,1fr))] 2xl:grid-cols-[repeat(3,minmax(20rem,1fr))]'>
          <AnimatePresence mode='popLayout'>
            {filteredPlans.map((plan) => (
              <m.div
                key={plan.frontUuid}
                initial={{ translateY: '10%', opacity: 0, zIndex: -20 }}
                animate={{
                  opacity: 1,
                  translateY: '0%',
                  zIndex: 20,
                }}
                exit={{
                  opacity: 0,
                  zIndex: -20,
                  translateY: '-10%',
                }}
              >
                <Card
                  tabIndex={0}
                  key={plan.frontUuid}
                  className={cn([
                    'flex h-full cursor-pointer flex-col justify-between gap-4 sm:min-h-44 sm:gap-4',
                    selected.includes(plan) ? 'ring ring-green-400/60' : '',
                  ])}
                  onMouseDown={(e) => onStart(e, plan)}
                  onTouchStart={(e) => onStart(e, plan)}
                  onMouseUp={(e) => onEnd(e, [plan])}
                  onTouchEnd={(e) => onEnd(e, [plan])}
                  onTouchMove={onMove}
                >
                  {selected.includes(plan) && (
                    <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6  fill-green-500 text-gray-50 dark:text-slate-950' />
                  )}

                  <div className='flex flex-col gap-4'>
                    <h5 className='text-base font-bold text-gray-800 dark:text-slate-200'>
                      {plan.name ?? 'Untitled plan'}
                    </h5>

                    <div className='flex flex-col gap-1 text-sm text-gray-500 dark:text-slate-500'>
                      <div className='flex w-full gap-2'>
                        <span className='font-semibold'>Created at:</span>

                        <span>{new Date(plan.createdAt).toDateString()}</span>
                      </div>

                      <div className='flex w-full gap-2'>
                        <span className='font-semibold'>Plan duration:</span>

                        <span>{plan.durationDays} days</span>
                      </div>

                      <div className='flex w-full gap-2'>
                        <span className='font-semibold'>Current day:</span>

                        <span>
                          {studySessions.find(
                            (s) => s.planId === plan.frontUuid,
                          )?.currentDay === 0
                            ? 'Not started'
                            : studySessions.find(
                                (s) => s.planId === plan.frontUuid,
                              )?.currentDay}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex w-full items-center justify-between'>
                    <div className='flex w-full items-center gap-2'>
                      {plan.focusTags && (
                        <div className='flex flex-wrap gap-2'>
                          {plan.focusTags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
