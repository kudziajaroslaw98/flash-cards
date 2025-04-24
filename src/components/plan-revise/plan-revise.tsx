'use client';

import { useRedirectUnauthorized } from '#/hooks/use-redirect-unauthorized';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import type { StudyPlan } from '#/types/study-plan.type';
import { format } from 'date-fns';
import { AlarmClock, ArrowRight, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../_ui/button/button';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import { ReviseStages } from './revise-stages';

export function PlanRevise() {
  const { setPickedPlan, pickedPlan, currentDay, currentSession, studyPlans } =
    useRevisePlanContext();
  const [showHowDareYou, setShowHowDareYou] = useState(false);

  const router = useRouter();
  useRedirectUnauthorized({
    redirectOnInactivePlan: true,
    inactivePathname: APP_ROUTES.pricing,
  });

  const handlePlanPick = (plan: StudyPlan) => {
    setPickedPlan(plan);
  };

  const shameOnYou = () => {
    setShowHowDareYou(true);
    setTimeout(() => {
      router.push(APP_ROUTES.flashcards.learn);
    }, 3000);
  };

  // Memoize dropdown configuration
  const dropdownConfig = useMemo(() => {
    return studyPlans.map((plan) => ({
      value: plan,
      label:
        plan.name ??
        `Plan created on ${format(new Date(plan.createdAt).toDateString(), 'yyyy-MM-dd')}, duration ${plan.durationDays} day(s)`,
    }));
  }, [studyPlans]);

  // Effect to handle the easter egg display timeout
  useEffect(() => {
    // eslint-disable-next-line no-undef
    let timer: NodeJS.Timeout;
    if (showHowDareYou) {
      timer = setTimeout(() => {
        // Redirect logic is now inside the shameOnYou function
      }, 3000); // Duration the image is shown
    }
    return () => clearTimeout(timer);
  }, [showHowDareYou, router]);

  const NoPlansAvailable = () => (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
      <div className='flex w-full flex-col items-center justify-center py-10 text-center'>
        <AlarmClock className='mb-8 size-12 text-green-500' />
        <span>Plan missing. Time to adult?</span>
        <span>(Or just hit snooze?)</span>
        <div className='mt-8 flex flex-col gap-2'>
          <div className='flex gap-6'>
            <LinkComponent href={APP_ROUTES.study.newPlan}>
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
              alt='Shame user and redirect'
            />
          </div>
        </div>
      </div>
    </div>
  );

  const SelectPlan = () => (
    <div className='flex h-full w-full flex-col items-center pt-32'>
      <Dropdown<StudyPlan>
        multiple={false}
        type='dropdown'
        config={dropdownConfig}
        onChange={handlePlanPick}
        contextPosition={'bottom'}
        labelClassName='max-w-xs bg-gray-50 dark:bg-slate-950'
        contextClassName='!max-w-xs'
        controlLabel='Pick a study plan to revise'
        label='Study Plans'
        required
        valid // Assume valid until proven otherwise
      />
    </div>
  );

  const RevisionFinished = () => (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex max-w-72 flex-col items-center justify-center gap-1 py-10 pt-24 text-center md:max-w-full'>
        <PartyPopper className='mb-8 size-12 text-green-500' />
        <span>Looks like you finished your revision day, good job!</span>
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
    </div>
  );

  // Main component logic
  if (showHowDareYou) {
    return (
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
    );
  }

  if (!pickedPlan) {
    return studyPlans.length === 0 ? <NoPlansAvailable /> : <SelectPlan />;
  }

  if (!currentDay || !currentSession) {
    // Handle loading or error state for current day/session
    return (
      <div className='flex h-full w-full items-center justify-center'>
        Loading plan data...
      </div>
    ); // Or a loading spinner
  }

  // Check if the revision for today is already done
  const isRevisionDue = new Date() >= new Date(currentSession.nextRevisionDate);

  return (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
        {isRevisionDue ? <ReviseStages /> : <RevisionFinished />}
      </div>
    </div>
  );
}
