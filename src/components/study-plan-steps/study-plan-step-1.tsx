'use client';

import type { PlanSetupState } from '#/app/(pages)/study/plans/new/page';
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

  return (
    <div className='flex w-full flex-col items-start'>
      <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
        Set Your Learning Focus & Knowledge Level
      </h2>
      <span className='size-xs text-gray-500'>
        Tell us what you want to study and your current knowledge level.
        Selecting tags defines your topic, and knowledge level helps the AI
        personalize the plan to your starting point.
      </span>

      <div className='flex w-full flex-col items-center justify-center py-12'>
        <div className='flex w-80 flex-col items-center justify-center gap-8'>
          <FormComponent<{
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
                  multiple: false,
                  required: true,
                  label: 'Your Knowledge Level',
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
                  label: 'Study Scope',
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
                _internal_separator_1: {
                  type: '_internal_separator',
                },
                _internal_accordion_1: {
                  type: '_internal_accordion',
                },
                preferredFormat: {
                  type: 'dropdown',
                  multiple: false,
                  label: 'Preferred Format',
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
                  label: 'Content Emphasis',
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
                learningStyle: {
                  type: 'dropdown',
                  multiple: false,
                  label: 'Learning Style',
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
                  label: 'Difficulty Distribution',
                  multiple: false,
                  controlLabel: 'Difficulty Distribution',
                  config: difficultyDistributionDictionary,
                  _internal_default_value: null,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'difficultyDistribution',
                      constraint: difficultyDistributionSchema.nullish(),
                    },
                  ],
                },
                cardLength: {
                  type: 'dropdown',
                  label: 'Card Length',
                  multiple: false,
                  controlLabel: 'Card Length',
                  config: cardLengthDictionary,
                  _internal_default_value: null,
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'cardLength',
                      constraint: cardLengthSchema.nullish(),
                    },
                  ],
                },
                mnemonicPreference: {
                  type: 'dropdown',
                  multiple: false,
                  label: 'Mnemonic Preference',
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
            }}
            className='w-80'
            emitFormValue={(value) =>
              setState((prev) => ({ ...prev, step1: value }))
            }
            ref={formRef}
            initialValues={state?.step1}
            debug={{
              inputs: true,
              values: true,
            }}
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
