'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StepperProgress } from './stepper-progress';

type ProgressStep = ReactNode & {
  stepLabel: string;
  stepIdentificator: string;
};

type StepperContextType = {
  currentStep: number;
  totalSteps: number;
  steps: Exclude<ReactNode, boolean | null | undefined>[];
  goToNext: () => void;
  goToPrev: () => void;
  isCompleted: (step: number) => boolean;
};

type StepperProps = {
  children: React.ReactNode;
};

const StepperContext = createContext<StepperContextType | null>(null);

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) throw new Error('useStepper must be used within a Stepper');
  return context;
};

export const Stepper = ({ children }: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = React.Children.count(children);
  const steps = React.Children.toArray(children);
  const direction = useRef(1);

  const goToNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      direction.current = 1;
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      direction.current = -1;
    }
  };

  const isCompleted = (step: number) => step < currentStep;

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      goToNext,
      goToPrev,
      isCompleted,
      steps,
    }),
    [currentStep, totalSteps, steps],
  );

  return (
    <StepperContext.Provider value={value}>
      <div className='mx-auto w-full max-w-4xl p-6'>
        <StepperProgress />
        <AnimatePresence mode='popLayout'>
          <m.div
            key={'stepper-step-' + currentStep}
            initial={{
              opacity: 0,
              x: direction.current * -100,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: direction.current * -100,
            }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep - 1]}
          </m.div>
        </AnimatePresence>
      </div>
    </StepperContext.Provider>
  );
};
