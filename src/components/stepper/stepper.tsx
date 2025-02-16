'use client';

import * as m from 'motion/react-m';
import React, { useEffect, type PropsWithChildren } from 'react';
import { useStepper } from './stepper-context';
import { StepperProgress } from './stepper-progress';

export const Stepper = ({ children }: PropsWithChildren) => {
  const { setTotalSteps, setSteps, direction, currentStep } = useStepper();
  const steps = React.Children.toArray(children);

  useEffect(() => {
    setTotalSteps(React.Children.count(children));
    setSteps(React.Children.toArray(children));
  }, [children]);

  return (
    <div className='flex w-full flex-col justify-center px-2 py-6'>
      <StepperProgress />
      <m.div
        key={'stepper-step-' + currentStep}
        initial={{
          opacity: 0,
          x: direction * -100,
        }}
        animate={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: direction * -100,
          height: 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {steps[currentStep - 1]}
      </m.div>
    </div>
  );
};
