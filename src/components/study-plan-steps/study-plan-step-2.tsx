import type { PlanSetupState } from '#/app/(pages)/study/new/page';
import { coverageFocusDictionary } from '#/dictionaries/coverage-focus.dictionary';
import { durationDictionary } from '#/dictionaries/duration.dictionary';
import { coverageFocusSchema } from '#/schemas/coverage-focus.schema';
import { planDurationSchema } from '#/schemas/plan-durations.schema';
import type { CoverageFocus } from '#/types/coverage-focus.type';
import type { PlanDuration } from '#/types/plan-durations.type';
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
}: {
  state: PlanSetupState;
  setState: Dispatch<SetStateAction<PlanSetupState>>;
}) {
  const [_isValid, setIsValid] = useState(true);
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      coverageFocus: CoverageFocus;
      duration: PlanDuration;
      userPrompt: string;
      blacklist: string[];
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

  const handleFormValueChange = (value: Partial<PlanSetupState['step2']>) => {
    setState((prev) => ({ ...prev, step2: value }) as PlanSetupState);
  };
  return (
    <div className='flex w-full flex-col items-start'>
      <div className='flex w-full flex-col items-center justify-center py-4'>
        <div className='flex w-full max-w-2xl flex-col justify-center px-4'>
          <h2 className='mb-4 text-xl font-bold text-gray-700 dark:text-slate-400'>
            Plan Your Study Journey
          </h2>

          <span className='text-justify text-sm text-gray-500'>
            Select the type of study plan that fits your learning style and
            choose how long you want to study. This will shape the structure and
            pace of your plan.
          </span>
        </div>
      </div>
      <div className='flex w-full flex-col items-center justify-center py-12'>
        <div className='flex w-96 flex-col items-center justify-center gap-8'>
          <FormComponent<{
            coverageFocus?: CoverageFocus;
            duration: PlanDuration;
            blacklist: string[];
            userPrompt: string;
          }>
            scheme={{
              inputs: {
                coverageFocus: {
                  type: 'dropdown',
                  multiple: false,
                  config: coverageFocusDictionary,
                  label: 'Coverage Focus',
                  controlLabel: 'Coverage Focus',
                  required: true,
                  _internal_default_value: 'core',
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'coverageFocus',
                      constraint: coverageFocusSchema,
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
                blacklist: {
                  type: 'tags',
                  maxTags: 10,
                  name: 'blacklist',
                  label: 'Topics to exclude',
                  _internal_default_value: state?.step2?.blacklist || [],
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'blacklist',
                      constraint: z
                        .array(z.string())
                        .max(10, 'Too many tags')
                        .nullish(),
                    },
                  ],
                },
                userPrompt: {
                  type: 'textarea',
                  name: 'userPrompt',
                  label: 'User Prompt',
                  placeholder:
                    'Add any specific instructions or preferences here...',
                  _internal_default_value: state?.step2?.userPrompt || '',
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'userPrompt',
                      constraint: z
                        .string()
                        .max(200, 'Prompt is too long, max 200 characters')
                        .nullish(),
                    },
                  ],
                },
              },
            }}
            className='w-80'
            emitFormValue={handleFormValueChange}
            ref={formRef}
            initialValues={state?.step2}
          />

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
  );
}
