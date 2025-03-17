import type { PlanSetupState } from '#/app/(pages)/study/plans/new/page';
import { durationDictionary } from '#/dictionaries/duration.dictionary';
import { planTypeDictionary } from '#/dictionaries/plan-type.dictionary';
import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { planTypeSchema } from '#/schemas/plan-types.schema';
import type { PlanDuration } from '#/types/plan-durations.type';
import type { PlanType } from '#/types/plan-types.type';
import { ArrowRight } from 'lucide-react';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from '../_ui/button/button';
import type { FormMethods } from '../form-component/form';
import FormComponent from '../form-component/form';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep2({
  state,
  setState,
}: {
  state: PlanSetupState;
  setState: Dispatch<SetStateAction<PlanSetupState>>;
}) {
  const [isValid, setIsValid] = useState(true);
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      planType: PlanType;
      duration: PlanDuration;
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
            planType: PlanType;
            duration: PlanDuration;
          }>
            scheme={{
              inputs: {
                planType: {
                  type: 'dropdown',
                  multiple: false,
                  config: planTypeDictionary,
                  label: 'Study Plan Type',
                  controlLabel: 'Plan Type',
                  required: true,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'planType',
                      constraint: planTypeSchema,
                    },
                  ],
                },
                duration: {
                  type: 'dropdown',
                  multiple: false,
                  label: 'Duration',
                  controlLabel: 'Plan Duration',
                  required: true,
                  config: durationDictionary,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'duration',
                      constraint: planDurationSchema,
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
