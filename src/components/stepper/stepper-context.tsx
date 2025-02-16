import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

type StepperContextType = {
  currentStep: number;
  totalSteps: number;
  steps: Exclude<ReactNode, boolean | null | undefined>[];
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
  isCompleted: (step: number) => boolean;
  setSteps: (steps: Exclude<ReactNode, boolean | null | undefined>[]) => void;
  setTotalSteps: (steps: number) => void;
  direction: number;
};

const StepperContext = createContext<StepperContextType | null>(null);

export const StepperProvider = ({ children }: PropsWithChildren) => {
  const stepsRef = useRef<Exclude<ReactNode, boolean | null | undefined>[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(0);
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

  const goToIndex = (index: number) => {
    if (index < 1 || index > totalSteps) return;
    setCurrentStep(index);

    if (index > currentStep) {
      direction.current = 1;
    } else {
      direction.current = -1;
    }
  };

  const setSteps = (steps: Exclude<ReactNode, boolean | null | undefined>[]) =>
    (stepsRef.current = steps);

  const isCompleted = (step: number) => step < currentStep;

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      goToNext,
      goToPrev,
      goToIndex,
      isCompleted,
      steps: stepsRef.current,
      setSteps,
      setTotalSteps,
      direction: direction.current,
    }),
    [currentStep, totalSteps, stepsRef],
  );

  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
};

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) throw new Error('useStepper must be used within a Stepper');
  return context;
};
