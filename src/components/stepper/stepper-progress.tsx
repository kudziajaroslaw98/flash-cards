import { useThemeContext } from '#/providers/theme-provider.component';
import { cn } from '#/shared/utils/cn.util';
import * as m from 'motion/react-m';
import { Children } from 'react';
import Tooltip from '../_ui/tooltip/tooltip';
import { useStepper } from './stepper';

export const StepperProgress = () => {
  const { currentStep, totalSteps, isCompleted, steps } = useStepper();
  const { isLightMode } = useThemeContext();

  const progressBarVariants = (completed: boolean, currentStep: boolean) => {
    let backgroundImage = '';
    let maskImage = '';

    if (currentStep && !completed) {
      backgroundImage = `linear-gradient(to right, rgba(34 197 94 .5), rgba(34 197 94 .5))`;
      maskImage = 'linear-gradient(to right, black 8px, transparent 4px)';
    } else if (completed) {
      backgroundImage =
        'linear-gradient(to right, rgb(34 197 94), rgb(34 197 94))';
      maskImage = 'linear-gradient(to right, black 12px, transparent 0px)';
    } else {
      backgroundImage = `linear-gradient(to right, ${isLightMode ? 'rgb(209 213 219)' : 'rgb(30 41 59)'}, ${isLightMode ? 'rgb(209 213 219)' : 'rgb(30 41 59)'})`;
      maskImage = 'linear-gradient(to right, black 8px, transparent 4px)';
    }

    return {
      initial: {
        backgroundImage:
          'linear-gradient(to right, rgba(229 231 235 .2), rgba(229 231 235 .2))',
      },
      animate: {
        backgroundImage,
        maskSize: '12px 12px',
        maskImage,
      },
    };
  };

  return (
    <div className='relative mb-8'>
      <div className='flex justify-between'>
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const completed = isCompleted(stepIndex);
          const isCurrent = stepIndex === currentStep;

          return (
            <div
              key={`step-${stepIndex}`}
              className='relative flex flex-1 flex-col items-center'
            >
              {/* Connecting Line */}
              {index > 0 && (
                <div className='absolute left-[-50%] right-[50%] top-3 h-0.5'>
                  <m.div
                    variants={progressBarVariants(completed, isCurrent)}
                    className={`absolute left-[30%] top-0 h-full w-[40%] md:left-[12%] md:w-[75%]`}
                    initial={'initial'}
                    animate={'animate'}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Step Indicator */}
              <Tooltip
                content={
                  <span className='cursor-default'>
                    {/* @ts-expect-error prop required by component, always available */}
                    {Children.only(step)?.props?.stepLabel}
                  </span>
                }
                position='bottom'
                className='w-32'
              >
                <m.div
                  className={cn([
                    'flex h-6 w-auto min-w-8 cursor-default items-center justify-center rounded-md border-2 px-2 text-xs font-medium transition',
                    !completed &&
                      !isCurrent &&
                      'border-dashed border-gray-200 text-gray-300 dark:border-slate-800 dark:text-slate-800',
                    completed && 'border-green-500 bg-green-500 text-white',
                    isCurrent &&
                      'border-solid border-green-500 text-green-500 dark:border-green-500 dark:text-green-500',
                  ])}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {/* @ts-expect-error prop required by component, always available */}
                  {Children.only(step)?.props?.stepIdentificator}
                </m.div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};
