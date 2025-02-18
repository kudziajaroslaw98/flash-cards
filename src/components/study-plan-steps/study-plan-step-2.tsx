import { ArrowRight } from 'lucide-react';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { z } from 'zod';
import { Button } from '../_ui/button/button';
import type { FormMethods } from '../form-component/form';
import FormComponent from '../form-component/form';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep2({
  state,
  setState,
  planTypes,
  durations,
}: {
  state: any;
  setState: Dispatch<SetStateAction<any>>;
  planTypes: readonly ['overview', 'deep-dive', 'quick-review', 'exam-prep'];
  durations: readonly ['1', '3', '5', '7', '14', '30'];
}) {
  const [isValid, setIsValid] = useState(true);
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      planType: 'overview' | 'deep-dive' | 'quick-revision' | 'exam-prep';
      duration: 1 | 3 | 5 | 7 | 14 | 30;
    }>
  >(null);

  const handleOnClick = async () => {
    await formRef.current?.checkValidity();
    if (!formRef.current?.isValid()) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    goToNext();
  };
  return (
    <div className='flex w-full flex-col items-start'>
      <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
        Plan Your Study Journey
      </h2>

      <p className='size-sm text-gray-500'>
        Select the type of study plan that fits your learning style and choose
        how long you want to study. This will shape the structure and pace of
        your plan.
      </p>
      <div className='flex w-full flex-col items-center justify-center py-12'>
        <div className='flex w-80 flex-col items-center justify-center gap-8'>
          <FormComponent<{
            planType: 'overview' | 'deep-dive' | 'quick-revision' | 'exam-prep';
            duration: 1 | 3 | 5 | 7 | 14 | 30;
          }>
            scheme={{
              inputs: {
                planType: {
                  type: 'dropdown',
                  config: [
                    {
                      value: 'overview',
                      label: 'Comprehensive Overview',
                    },
                    { value: 'deep-dive', label: 'Deep Dive' },
                    { value: 'quick-revision', label: 'Quick Revision' },
                    { value: 'exam-prep', label: 'Exam Preparation' },
                  ],
                  label: 'Study Plan Type',
                  controlLabel: 'Plan Type',
                  required: true,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'planType',
                      constraint: z
                        .string()
                        .min(1, 'Plan type is required')
                        .refine(
                          (value) => planTypes.includes(value),
                          'Plan type is required',
                        ),
                    },
                  ],
                },
                duration: {
                  type: 'dropdown',
                  label: 'Duration',
                  controlLabel: 'Plan Duration',
                  required: true,
                  config: [
                    { value: '1', label: '1 day' },
                    { value: '3', label: '3 days' },
                    { value: '5', label: '5 days' },
                    { value: '7', label: '7 days' },
                    { value: '14', label: '14 days' },
                    { value: '30', label: '30 days' },
                  ],
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'duration',
                      constraint: z
                        .string()
                        .min(1, 'Duration is required')
                        .refine(
                          (value) => durations.includes(value),
                          'Duration is required',
                        ),
                    },
                  ],
                },
              },
            }}
            className='w-80'
            emitFormValue={(value) =>
              setState((prev) => ({ ...prev, step2: value }))
            }
            ref={formRef}
            initialValues={state?.step2}
          />

          <div className='w-full px-4'>
            <Button
              alt='Continue'
              onClick={handleOnClick}
              label='Continue'
              variant='secondary'
              icon={<ArrowRight className='size-4' />}
              iconPosition='right'
              size={'full'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
