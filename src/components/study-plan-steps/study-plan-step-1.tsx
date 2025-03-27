'use client';

import type { PlanSetupState } from '#/app/(pages)/study/new/page';
import { cardLengthDictionary } from '#/dictionaries/card-length.dictionary';
import { contentEmphasisDictionary } from '#/dictionaries/content-emphasis.dictionary';
import { difficultyDistributionDictionary } from '#/dictionaries/difficulty-distribution.dictionary';
import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { learningStyleDictionary } from '#/dictionaries/learning-style.dictionary';
import { mnemonicPreferenceDictionary } from '#/dictionaries/mnemonic-preference.dictionary';
import { preferredFormatDictionary } from '#/dictionaries/preferred-format.dictionary';
import { studyScopeDictionary } from '#/dictionaries/study-scope.dictionary';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { contentEmphasisSchema } from '#/schemas/content-emphasis.schema';
import { difficultyDistributionSchema } from '#/schemas/difficulty-distribution.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { planStudyScopeSchema } from '#/schemas/plan-study-scope.schema';
import { preferredQuestionFormatsSchema } from '#/schemas/preferred-question-formats.schema';
import type { CardLength } from '#/types/card-length.type';
import type { ContentEmphasis } from '#/types/content-emphasis.type';
import type { DifficultyDistribution } from '#/types/difficulty-distribution.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import type { LearningStyleAdaptation } from '#/types/learning-style.type';
import type { MnemonicPreferences } from '#/types/mnemonic-preference.type';
import type { PlanStudyScope } from '#/types/plan-study-scope.type';
import type { PreferredQuestionFormats } from '#/types/preferred-question-formats.type';
import { ArrowRight } from 'lucide-react';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { z } from 'zod';
import { Button } from '../_ui/button/button';
import FormComponent, { type FormMethods } from '../form-component/form';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep1({
  state,
  setState,
}: {
  state: PlanSetupState;
  setState: Dispatch<SetStateAction<PlanSetupState>>;
}) {
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      focusTags: string[];
      studyScope: PlanStudyScope;
      knowledgeLevel: KnowledgeLevel;
      preferredFormat?: PreferredQuestionFormats;
      contentEmphasis?: ContentEmphasis;
      learningStyle?: LearningStyleAdaptation;
      difficultyDistribution?: DifficultyDistribution;
      cardLength?: CardLength;
      mnemonicPreference?: MnemonicPreferences;
    }>
  >(null);

  const handleOnClick = async () => {
    await formRef.current?.checkValidity();
    if (!formRef.current?.isValid()) {
      return;
    }
    goToNext();
  };

  const handleFormValueChange = (value: Partial<PlanSetupState['step1']>) => {
    setState((prev) => ({ ...prev, step1: value }) as PlanSetupState);
  };

  return (
    <div className='flex w-full flex-col items-start'>
      <div className='flex w-full flex-col items-center justify-center py-4'>
        <div className='flex w-full max-w-2xl flex-col justify-center px-4 '>
          <h2 className='mb-4 text-xl font-bold text-gray-700 dark:text-slate-400'>
            Personalize Your Learning Plan
          </h2>

          <span className='text-justify text-sm text-gray-500'>
            Select tags to define your study topic and indicate your current
            knowledge level. This helps our AI create the best starting point
            for you.
          </span>
        </div>
      </div>

      <div className='flex w-full flex-col items-center justify-center py-12'>
        <div className='flex w-96 flex-col items-center justify-center gap-8'>
          <FormComponent<PlanSetupState['step1']>
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
                    { value: 'English', label: 'English' },
                    { value: 'Vocabulary', label: 'Vocabulary' },
                    {
                      value: 'Daily Conversations',
                      label: 'Daily Conversations',
                    },
                    { value: 'Idioms', label: 'Idioms' },
                  ],
                  multiple: true,
                  multipleLabel: 'Tags',
                  label: 'Choose tags...',
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
                  multiple: false,
                  required: true,
                  label: 'Choose level...',
                  controlLabel: 'Select your knowledge level:',
                  config: knowledgeLevelDictionary,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'knowledgeLevel',
                      constraint: knowledgeLevelSchema,
                    },
                  ],
                },
                studyScope: {
                  type: 'dropdown',
                  multiple: false,
                  label: 'Choose study scope...',
                  controlLabel: 'Study Scope',
                  config: studyScopeDictionary,
                  _internal_default_value: 'default',
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'studyScope',
                      constraint: planStudyScopeSchema,
                    },
                  ],
                },
                _internal_group_title_1: {
                  type: '_internal_group_title',
                  title: 'Advanced Options',
                },
                _internal_accordion_1: {
                  type: '_internal_accordion',
                  title: 'Content Preferences',
                  name: 'contentSection',
                  inputs: {
                    preferredFormat: {
                      type: 'dropdown',
                      multiple: false,
                      label: 'Choose preferred format...',
                      controlLabel: 'Preferred Format',
                      config: preferredFormatDictionary,
                      _internal_default_value: null,
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'preferredFormat',
                          constraint: preferredQuestionFormatsSchema.nullish(),
                        },
                      ],
                    },
                    contentEmphasis: {
                      type: 'dropdown',
                      multiple: false,
                      label: 'Choose content emphasis...',
                      controlLabel: 'Content Emphasis',
                      config: contentEmphasisDictionary,
                      _internal_default_value: null,
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'contentEmphasis',
                          constraint: contentEmphasisSchema.nullish(),
                        },
                      ],
                    },
                    cardLength: {
                      type: 'dropdown',
                      label: 'Choose card length...',
                      multiple: false,
                      controlLabel: 'Card Length',
                      config: cardLengthDictionary,
                      _internal_default_value: 'balanced',
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'cardLength',
                          constraint: cardLengthSchema.nullish(),
                        },
                      ],
                    },
                  },
                },
                _internal_accordion_2: {
                  type: '_internal_accordion',
                  title: 'Learning Style',
                  name: 'learningStyleSection',
                  inputs: {
                    learningStyle: {
                      type: 'dropdown',
                      multiple: false,
                      label: 'Choose learning style...',
                      controlLabel: 'Learning Style',
                      config: learningStyleDictionary,
                      _internal_default_value: null,
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'learningStyle',
                          constraint: learningStyleAdaptationSchema.nullish(),
                        },
                      ],
                    },
                    difficultyDistribution: {
                      type: 'dropdown',
                      label: 'Choose difficulty distribution...',
                      multiple: false,
                      controlLabel: 'Difficulty Distribution',
                      config: difficultyDistributionDictionary,
                      _internal_default_value: 'balanced',
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'difficultyDistribution',
                          constraint: difficultyDistributionSchema.nullish(),
                        },
                      ],
                    },

                    mnemonicPreference: {
                      type: 'dropdown',
                      multiple: false,
                      label: 'Choose mnemonic preference...',
                      controlLabel: 'Mnemonic Preference',
                      config: mnemonicPreferenceDictionary,
                      _internal_default_value: null,
                      _internal_constraints: [
                        {
                          type: 'validation',
                          key: 'mnemonicPreference',
                          constraint: mnemonicPreferencesSchema.nullish(),
                        },
                      ],
                    },
                  },
                },
              },
            }}
            className='w-full px-4'
            emitFormValue={handleFormValueChange}
            ref={formRef}
            initialValues={state?.step1}
            debug={{
              inputs: true,
              values: true,
            }}
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
