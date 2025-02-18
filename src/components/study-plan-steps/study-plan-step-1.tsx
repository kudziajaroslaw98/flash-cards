'use client';

import { ArrowRight } from 'lucide-react';
import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { z } from 'zod';
import { Button } from '../_ui/button/button';
import FormComponent, { type FormMethods } from '../form-component/form';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep1({
  state,
  setState,
}: {
  state: any;
  setState: Dispatch<SetStateAction<any>>;
}) {
  const [isValid, setIsValid] = useState(true);
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      focusTags: string[];
      studyScope: 'default' | 'comprehensive' | 'specific';
      knowledgeLevel:
        | 'unfamiliar'
        | 'beginner'
        | 'developing'
        | 'proficient'
        | 'advanced'
        | 'expert';
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
        Set Your Learning Focus & Knowledge Level
      </h2>
      <p className='size-sm text-gray-500'>
        Tell us what you want to study and your current knowledge level.
        Selecting tags defines your topic, and knowledge level helps the AI
        personalize the plan to your starting point.
      </p>

      <div className='flex w-full flex-col items-center justify-center py-12'>
        <div className='flex w-80 flex-col items-center justify-center gap-8'>
          <FormComponent<{
            focusTags: string[];
            studyScope: 'default' | 'comprehensive' | 'specific';
            knowledgeLevel:
              | 'unfamiliar'
              | 'beginner'
              | 'developing'
              | 'proficient'
              | 'advanced'
              | 'expert';
          }>
            scheme={{
              inputs: {
                focusTags: {
                  type: 'dropdown',
                  config: [
                    { value: 'Physics', label: 'Physics' },
                    { value: 'Chemistry', label: 'Chemistry' },
                    {
                      value: 'Computer Science',
                      label: 'Computer Science',
                    },
                    { value: 'Programming', label: 'Programming' },
                    { value: 'Biology', label: 'Biology' },
                    { value: 'Cells', label: 'Cells' },
                    { value: 'Fundamentals', label: 'Fundamentals' },
                    { value: 'Anatomy', label: 'Anatomy' },
                    { value: 'Human', label: 'Human' },
                    { value: 'Statystyka', label: 'Statystyka' },
                    {
                      value: 'Logistyka dystrybucji',
                      label: 'Logistyka dystrybucji',
                    },
                    {
                      value: 'Metody zarządzania jakością',
                      label: 'Metody zarządzania jakością',
                    },
                    {
                      value: 'Gospodarka Magazynowa',
                      label: 'Gospodarka Magazynowa',
                    },
                    {
                      value: 'linq',
                      label: 'linq',
                    },
                    {
                      value: 'entity framework',
                      label: 'entity framework',
                    },
                    {
                      value: 'ado.net',
                      label: 'ado.net',
                    },
                    {
                      value: 'orm',
                      label: 'orm',
                    },
                  ],
                  multiple: true,
                  multipleLabel: 'Tags',
                  label: 'Tags',
                  controlLabel: 'Focus Tags',
                  addNew: true,
                  required: true,
                  _internal_default_value: [],
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'focusTags',
                      constraint: z
                        .array(z.string().min(1))
                        .min(1, 'Tags are required'),
                    },
                  ],
                },
                knowledgeLevel: {
                  type: 'dropdown',
                  required: true,
                  label: 'Your Knowledge Level',
                  controlLabel: 'Select your knowledge level:',
                  config: [
                    { value: 'unfamiliar', label: 'Unfamiliar (1-15%)' },
                    { value: 'beginner', label: 'Beginner (16-30%)' },
                    { value: 'developing', label: 'Developing (31-55%)' },
                    { value: 'proficient', label: 'Proficient (56-75%)' },
                    { value: 'advanced', label: 'Advanced (76-90%)' },
                    { value: 'expert', label: 'Expert (91-100%)' },
                  ],
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'knowledgeLevel',
                      constraint: z
                        .string()
                        .min(1, 'Knowledge Level is required'),
                    },
                  ],
                },
                studyScope: {
                  type: 'dropdown',
                  label: 'Study Scope',
                  controlLabel: 'Study Scope',
                  config: [
                    { value: 'default', label: 'Focus on Core Concepts' },
                    {
                      value: 'comprehensive',
                      label: 'Comprehensive Coverage',
                    },
                    {
                      value: 'specific',
                      label: 'Specific Area within Tags',
                    },
                  ],
                  _internal_default_value: 'default',
                },
              },
            }}
            className='w-80'
            emitFormValue={(value) =>
              setState((prev) => ({ ...prev, step1: value }))
            }
            ref={formRef}
            initialValues={state?.step1}
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
