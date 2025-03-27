'use client';

import { useStepper } from './stepper-context';

type StepperStepProps = {
  children: React.ReactNode;
  index: number;
  stepLabel: string;
  stepIdentification: string;
};
export const StepperStep = ({ children, index }: StepperStepProps) => {
  const { currentStep } = useStepper();
  if (currentStep !== index) return null;

  return (
    <div className='flex w-full flex-col justify-center py-6'>{children}</div>
  );
};
