'use client';

import { useStepper } from './stepper-context';

type StepperStepProps = {
  children: React.ReactNode;
  index: number;
  stepLabel: string;
  stepIdentificator: string;
};
export const StepperStep = ({ children, index }: StepperStepProps) => {
  const { currentStep } = useStepper();
  if (currentStep !== index) return null;

  return (
    <div className='juctify-center flex w-full flex-col py-6'>{children}</div>
  );
};
