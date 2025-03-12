'use client';

import { db } from '#/db/dexie.db';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlarmClock, ArrowRight, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import { Case } from '../_ui/switch-case/case';
import { SwitchCase } from '../_ui/switch-case/switch-case';
import { ReviseStages } from './revise-stages';

export function PlanRevise() {
  const [reviseStage, setReviseStage] = useState<number>(0);
  const [pickedPlan, setPickedPlan] = useState<StudyPlan | null>(null);
  const [showHowDareYou, setShowHowDareYou] = useState(false);
  const [dropdownConfig, setDropdownConfig] = useState<
    { value: StudyPlan; label: string }[]
  >([]);
  const [currentDay, setCurrentDay] = useState<StudyDay | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null,
  );
  const [clicked, setClicked] = useState(false);

  const router = useRouter();

  const studySession = useLiveQuery(
    () =>
      db.studySessions
        .where('planId')
        .equals(pickedPlan?.id ?? '')
        .first(),
    [pickedPlan],
  );
  const studyDays = useLiveQuery(
    () =>
      db.studyDays
        .where('planId')
        .equals(pickedPlan?.id ?? '')
        .toArray(),
    [pickedPlan],
  );
  const studyPlans = useLiveQuery(() => db.studyPlans.toArray()) ?? [];
  const reviewFlashcards =
    useLiveQuery(() => {
      if (!currentDay) {
        return [];
      }
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentDay.cardsToReview])
        .toArray();
    }, [currentDay]) ?? [];
  const newFlashcards =
    useLiveQuery(() => {
      if (!currentDay) {
        return [];
      }
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentDay.newCards])
        .toArray();
    }, [currentDay]) ?? [];
  const completedFlashcards =
    useLiveQuery(() => {
      if (!currentSession) {
        return [];
      }
      console.log('🚀 ~ :84 ~ useLiveQuery ~ currentSession:', currentSession);
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentSession.completedCards])
        .toArray();
    }, [currentSession]) ?? [];

  const handlePlanPick = (plan: StudyPlan) => {
    setPickedPlan(plan);
  };

  const shameOnYou = () => {
    setShowHowDareYou(true);
    setTimeout(() => {
      router.push('/flashcards/learn');
    }, 3000);
  };

  useEffect(() => {
    setDropdownConfig(
      studyPlans.map((plan) => ({
        value: plan,
        label:
          plan.name ??
          `Plan created on ${format(new Date(plan.createdAt).toDateString(), 'yyyy-MM-dd')}, duration ${plan.durationDays} day(s)`,
      })),
    );
  }, [studyPlans]);

  useEffect(() => {
    if (studySession) {
      const currentDayNumber =
        studySession.currentDay === 0 ? 1 : studySession.currentDay;
      const currentDay = studyDays?.find(
        (day) => day.dayNumber === currentDayNumber,
      );
      if (currentDayNumber === 1 && studySession.stage === 0) {
        setReviseStage(3);
      } else {
        setReviseStage(studySession.stage);
      }
      setCurrentSession(studySession);
      setCurrentDay(currentDay ?? null);
    }
  }, [studySession, studyDays]);

  return (
    <div className='flex h-full w-full'>
      {showHowDareYou && (
        <div className='fixed left-0 top-0 z-[100000] flex h-full w-full flex-col items-center justify-center bg-gray-50 dark:bg-slate-950'>
          <Image
            width={320}
            height={240}
            src={'/images/how-dare-you.webp'}
            alt={'How dare you?'}
          />

          <p className='mt-4 text-center text-sm'>
            Flashcards will hunt for you now. <br /> You will not be able to
            escape 😜
          </p>
        </div>
      )}

      <SwitchCase condition={pickedPlan === null}>
        <Case caseValue={true}>
          <SwitchCase condition={studyPlans.length === 0}>
            <Case caseValue={true}>
              <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
                <div className='flex w-full flex-col items-center justify-center py-10 text-center'>
                  <AlarmClock className='mb-8 size-12 text-green-500' />
                  <span>Plan missing. Time to adult?</span>

                  <span>(Or just hit snooze?)</span>

                  <div className='mt-8 flex flex-col gap-2'>
                    <div className='flex gap-6'>
                      <LinkComponent href='/study/plans/new'>
                        <Button
                          label={'Be Responsible?'}
                          icon={<ArrowRight className='size-4' />}
                          iconPosition='right'
                          alt='Redirect to new plan page'
                          variant={'primary-text'}
                        />
                      </LinkComponent>

                      <Button
                        onClick={shameOnYou}
                        label={'Eh, later..'}
                        variant={'secondary-text'}
                        alt='Redirect to new plan page'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Case>

            <Case caseValue={false}>
              <div className='flex h-full w-full flex-col items-center pt-32'>
                <Dropdown<StudyPlan>
                  config={dropdownConfig}
                  onChange={handlePlanPick}
                  contextPosition={'bottom'}
                  labelClassName='max-w-xs bg-gray-50 dark:bg-slate-950'
                  contextClassName='!max-w-xs'
                  controlLabel='Pick a study plan to revise'
                  label='Study Plans'
                  required
                />
              </div>
            </Case>
          </SwitchCase>
        </Case>

        <Case caseValue={false}>
          <div className='flex h-full w-full flex-col justify-stretch'>
            <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
              <SwitchCase condition={currentDay === null}>
                <Case caseValue={true}>
                  <span>Current day unavailable, please try again.</span>
                </Case>

                <Case caseValue={false}>
                  <SwitchCase
                    condition={
                      currentSession &&
                      new Date(currentSession.nextRevisionDate) < new Date()
                    }
                  >
                    <Case caseValue={true}>
                      <ReviseStages
                        stage={reviseStage}
                        setStage={setReviseStage}
                        clicked={clicked}
                        setClicked={setClicked}
                        currentDay={currentDay!}
                        currentSession={studySession!}
                        completed={completedFlashcards}
                        reviewFlashcards={reviewFlashcards}
                        newFlashcards={newFlashcards}
                      />
                    </Case>

                    <Case caseValue={false}>
                      <div className='flex max-w-72 flex-col items-center justify-center gap-1 py-10 pt-24 text-center md:max-w-full'>
                        <PartyPopper className='mb-8 size-12 text-green-500' />
                        <span>
                          Looks like you finished your revision day, good job!
                        </span>
                        <span className='text-sm'>
                          Enjoy your remaining day, see you tomorrow!
                        </span>

                        <Link href={APP_ROUTES.flashcards.learn}>
                          <Button
                            alt='continue learning'
                            icon={<ArrowRight className='size-4' />}
                            label='Continue learning'
                            className='mt-8'
                          />
                        </Link>
                      </div>
                    </Case>
                  </SwitchCase>
                </Case>
              </SwitchCase>
            </div>
          </div>
        </Case>
      </SwitchCase>
    </div>
  );
}
