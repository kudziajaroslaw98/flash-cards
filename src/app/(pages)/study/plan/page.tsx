'use client';

import FormComponent from '#/components/form-component/form';
import { Stepper } from '#/components/stepper/stepper';
import { StepperStep } from '#/components/stepper/stepper-step';
import { z } from 'zod';

export default function StudyPlanPage() {
  const planTypes = ['overview', 'deep-dive', 'quick-review', 'exam-prep'];
  const durations = ['1', '3', '5', '7', '14', '30'];
  return (
    <div className='flex h-full w-full grow flex-col items-center gap-12 md:pb-12'>
      <Stepper>
        <StepperStep
          index={1}
          stepLabel='Study Goals'
          stepIdentificator='1'
        >
          <div className='flex w-full flex-col items-start'>
            <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
              Set Your Learning Focus
            </h2>
            <p className='size-sm text-gray-500'>
              Tell us what you want to study! Select the tags that represent the
              topics you want to learn. This helps the AI understand your
              learning goals.
            </p>

            <div className='flex min-h-96 w-full justify-center pt-12'>
              <FormComponent<{
                focusTags: string[];
                studyScope: 'default' | 'comprehensive' | 'specific';
              }>
                scheme={{
                  inputs: {
                    focusTags: {
                      type: 'dropdown',
                      config: [
                        { value: 'tag1', label: 'Tag 1' },
                        { value: 'tag2', label: 'Tag 2' },
                        { value: 'tag3', label: 'Tag 3' },
                        { value: 'tag4', label: 'Tag 4' },
                        { value: 'tag5', label: 'Tag 5' },
                        { value: 'tag6', label: 'Tag 6' },
                      ],
                      multiple: true,
                      multipleLabel: 'Tags',
                      label: 'Tags',
                      controlLabel: 'Focus Tags',
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
              />
            </div>
          </div>
        </StepperStep>

        <StepperStep
          index={2}
          stepLabel='Plan Type & Duration'
          stepIdentificator='2'
        >
          <div className='flex w-full flex-col items-start'>
            <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
              Plan Your Study Journey
            </h2>

            <p className='size-sm text-gray-500'>
              Select the type of study plan that fits your learning style and
              choose how long you want to study. This will shape the structure
              and pace of your plan.
            </p>
            <div className='flex min-h-96 w-full justify-center pt-12'>
              <FormComponent<{
                planType:
                  | 'overview'
                  | 'deep-dive'
                  | 'quick-revision'
                  | 'exam-prep';
                duration: 1 | 3 | 5 | 7 | 14 | 30;
              }>
                scheme={{
                  inputs: {
                    planType: {
                      type: 'dropdown',
                      config: [
                        { value: 'overview', label: 'Comprehensive Overview' },
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
              />
            </div>
          </div>
        </StepperStep>

        <StepperStep
          index={3}
          stepLabel='Review AI Flashcard'
          stepIdentificator='3'
        >
          <div className='flex w-full flex-col items-start'>
            <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
              Review & Enhance Flashcards
            </h2>

            <p className='size-sm text-gray-500'>
              Review AI Flashcard Suggestions - Edit, Add, & Customize
            </p>
            {/* Your form fields here */}
          </div>
        </StepperStep>

        <StepperStep
          index={4}
          stepLabel='Generate & Review Study Plan'
          stepIdentificator='4'
        >
          <div className='flex w-full flex-col items-start'>
            <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
              Get Your Personalized Study Plan
            </h2>
            <p className='size-sm text-gray-500'>
              Review Your Study Plan - Ready to Learn!
            </p>
            {/* Your form fields here */}
          </div>
        </StepperStep>
      </Stepper>
    </div>
  );
}
