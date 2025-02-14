'use client';

import * as m from 'motion/react-m';
import { useStepper } from './stepper';

type StepperStepProps = {
  children: React.ReactNode;
  index: number;
  stepLabel: string;
  stepIdentificator: string;
};

const PrevButton = () => {
  const { goToPrev, currentStep } = useStepper();
  if (currentStep === 1) return null;

  return (
    <m.button
      onClick={goToPrev}
      className='rounded-lg bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Back
    </m.button>
  );
};

const NextButton = () => {
  const { goToNext, currentStep, totalSteps } = useStepper();

  return (
    <m.button
      onClick={goToNext}
      className='rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {currentStep === totalSteps ? 'Finish' : 'Next'}
    </m.button>
  );
};

export const StepperStep = ({ children, index }: StepperStepProps) => {
  const { currentStep } = useStepper();
  if (currentStep !== index) return null;

  return (
    <div className='w-full space-y-6'>
      {children}
      <div className='flex w-full justify-center gap-4'>
        <PrevButton />
        <NextButton />
      </div>
    </div>
  );
};
