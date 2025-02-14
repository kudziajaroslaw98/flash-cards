'use client';

import { Button } from '#/components/_ui/button/button';
import {
  AISuggestedFlashcard,
  type AISuggestedFlashcardType,
} from '#/components/flash-card/ai-suggested-flashcard';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import FormComponent from '#/components/form-component/form';
import { Stepper } from '#/components/stepper/stepper';
import { StepperStep } from '#/components/stepper/stepper-step';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Check, Sparkles, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
export default function StudyPlanPage() {
  const [state, setState] = useState({
    step1: {
      focusTags: [],
      studyScope: 'default',
      knowledgeLevel: '',
    },
    step2: {
      duration: '',
      planType: '',
    },
  });
  const planTypes = [
    'overview',
    'deep-dive',
    'quick-review',
    'exam-prep',
  ] as const;
  const durations = ['1', '3', '5', '7', '14', '30'] as const;

  const recommendedFlashcardsCount = {
    overview: {
      '1': [10, 15],
      '3': [30, 45],
      '5': [50, 75],
      '7': [70, 100],
      '14': [140, 200],
      '30': [300, 450],
    },
    'deep-dive': {
      '1': [10, 15],
      '3': [25, 35],
      '5': [40, 60],
      '7': [60, 80],
      '14': [120, 160],
      '30': [250, 350],
    },
    'quick-review': {
      '1': [5, 10],
      '3': [15, 25],
      '5': [25, 40],
      '7': [40, 60],
      '14': [80, 120],
      '30': [150, 250],
    },
    'exam-prep': {
      '1': [15, 20],
      '3': [40, 50],
      '5': [60, 80],
      '7': [80, 120],
      '14': [160, 240],
      '30': [350, 500],
    },
  } as const;

  const selectedFlashcards: Flashcard[] = [];
  const [recommendedSuggestions, setRecommendedSuggestions] = useState<
    AISuggestedFlashcardType[]
  >([]);

  const getRecomendedFlashcardCount = (
    duration: keyof (typeof recommendedFlashcardsCount)[keyof typeof recommendedFlashcardsCount],
    planType: keyof typeof recommendedFlashcardsCount,
  ) => {
    if (!duration || !planType) {
      return;
    }

    return recommendedFlashcardsCount[planType][duration];
  };

  const generateSuggestions = () => {
    submit({
      focusTags: state.step1.focusTags,
      studyScope: state.step1.studyScope,
      knowledgeLevel: state.step1.knowledgeLevel,
      planType: state.step2.planType,
      duration: state.step2.duration,
    });
  };
  const { object, submit, isLoading } = useObject({
    api: API_ROUTES.GENERATE_SUGGESTED_FLASHCARDS,
    schema: z.array(
      z.object({
        id: z.string(),
        topic: z.string(),
        query: z.string(),
        context: z.string(),
        definition: z.string(),
        tags: z.array(z.string()),
        examples: z.string(),
        keyPoints: z.string(),
        synonyms: z.string(),
        relatedFacts: z.string(),
      }),
    ),
  });

  useEffect(() => {
    if (!object) return;
    console.log(object);
    setRecommendedSuggestions(
      object
        ?.filter((flashcard) => flashcard)
        ?.map((flashcard) => ({
          type: 'single',
          ...flashcard,
        })) as AISuggestedFlashcardType[],
    );
  }, [object]);

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
              Set Your Learning Focus & Knowledge Level
            </h2>
            <p className='size-sm text-gray-500'>
              Tell us what you want to study and your current knowledge level.
              Selecting tags defines your topic, and knowledge level helps the
              AI personalize the plan to your starting point.
            </p>

            <div className='flex min-h-96 w-full justify-center pt-12'>
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
                initialValues={state?.step1}
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
                emitFormValue={(value) =>
                  setState((prev) => ({ ...prev, step2: value }))
                }
                initialValues={state?.step2}
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

            <div className='flex w-full flex-col gap-6'>
              <div className='flex gap-4 pt-1'>
                <span className='text-xs'>
                  Flashcards Selected: {selectedFlashcards.length}
                </span>
                <span className='text-xs'>|</span>
                <span className='text-xs'>
                  Minimum-Recommended:{' '}
                  {getRecomendedFlashcardCount(
                    state?.step2?.duration,
                    state?.step2?.planType,
                  )?.join('-')}
                </span>
              </div>

              <div className='flex flex-col gap-2'>
                <span>Your flashcards: </span>
                <div></div>
              </div>

              {selectedFlashcards.length === 0 && (
                <div className='flex max-w-96 flex-col gap-2'>
                  <span className='text-sm'>
                    Looks like you dont have minimum required flashcards for
                    effective plan generation, would you like to fill out space
                    with generated flashcards?
                  </span>
                  <Button
                    alt='generateFlashcards'
                    label='Generate Suggestions'
                    icon={<Sparkles className='size-4' />}
                    onClick={generateSuggestions}
                    loading={isLoading}
                  />
                </div>
              )}

              <div
                className={cn([
                  'grid h-auto w-full justify-center gap-4 transition-all',
                  'xl:justify-start',
                  'grid-cols-[repeat(auto-fit,11rem)]',
                ])}
              >
                <AnimatePresence mode='popLayout'>
                  {recommendedSuggestions.map((flashcard) => (
                    <AISuggestedFlashcard
                      key={flashcard?.id}
                      flashcard={flashcard}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {recommendedSuggestions.length > 0 && (
                <FloatingButtons>
                  <Button
                    icon={<Check className='size-4' />}
                    label='Accept All'
                    alt='accept suggestion'
                    size='sm'
                    className='w-48'
                  />

                  <Button
                    icon={<X className='size-4' />}
                    label='Reject All'
                    alt='reject suggestion'
                    variant={'destructive'}
                    size='sm'
                    className='w-48'
                  />
                </FloatingButtons>
              )}

              <div className='flex w-full flex-col gap-4'>
                <span>Suggested flashcards: </span>

                <div
                  className={cn([
                    'grid h-auto w-full justify-center gap-4 transition-all',
                    'xl:justify-start',
                    'grid-cols-[repeat(auto-fit,11rem)]',
                  ])}
                >
                  <AnimatePresence mode='popLayout'>
                    {recommendedSuggestions.map((flashcard) => (
                      <AISuggestedFlashcard
                        key={flashcard?.id}
                        flashcard={flashcard}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {recommendedSuggestions.length > 0 && (
                  <FloatingButtons>
                    <Button
                      icon={<Check className='size-4' />}
                      label='Accept All'
                      alt='accept suggestion'
                      size='sm'
                      className='w-48'
                    />

                    <Button
                      icon={<X className='size-4' />}
                      label='Reject All'
                      alt='reject suggestion'
                      variant={'destructive'}
                      size='sm'
                      className='w-48'
                    />
                  </FloatingButtons>
                )}
              </div>
            </div>
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
