'use client';

import type { PlanSetupState } from '#/app/(pages)/study/plans/new/page';
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
      <p className='size-sm text-gray-500'>
        Tell us what you want to study and your current knowledge level.
        Selecting tags defines your topic, and knowledge level helps the AI
        personalize the plan to your starting point.
      </p>

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
                      constraint: knowledgeLevelSchema,
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
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'studyScope',
                      constraint: planStudyScopeSchema,
                    },
                  ],
                },
                preferredFormat: {
                  type: 'dropdown',
                  label: 'Preferred Format',
                  controlLabel: 'Preferred Format',
                  config: [
                    { value: 'balanced', label: 'Balanced mix of all formats' },
                    {
                      value: 'application',
                      label: 'Focus on practical application questions',
                    },
                    {
                      value: 'compare-contrast',
                      label: 'Emphasize comparison questions',
                    },
                    {
                      value: 'problem-solving',
                      label: 'Prioritize problem-solving scenarios',
                    },
                    {
                      value: 'definition',
                      label: 'Concentrate on term definitions',
                    },
                    {
                      value: 'cause-effect',
                      label: 'Focus on cause and effect relationships',
                    },
                    {
                      value: 'process',
                      label: 'Emphasize process and mechanism questions',
                    },
                    {
                      value: 'analysis',
                      label: 'Focus on analytical breakdowns',
                    },
                    {
                      value: 'evaluation',
                      label: 'Prioritize evaluation and judgment questions',
                    },
                    {
                      value: 'recall',
                      label: 'Focus on factual recall questions',
                    },
                  ],
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
                  label: 'Content Emphasis',
                  controlLabel: 'Content Emphasis',
                  config: [
                    {
                      value: 'balanced',
                      label: 'Balanced coverage across subtopics',
                    },
                    {
                      value: 'fundamentals',
                      label: 'Emphasize fundamental principles',
                    },
                    {
                      value: 'edge-cases',
                      label: 'Focus on edge cases and exceptions',
                    },
                    {
                      value: 'current-trends',
                      label: 'Highlight current trends and developments',
                    },
                    {
                      value: 'historical',
                      label: 'Include historical development and background',
                    },
                    {
                      value: 'practical',
                      label: 'Emphasize practical aspects and applications',
                    },
                    {
                      value: 'theoretical',
                      label: 'Focus on theoretical foundations',
                    },
                    {
                      value: 'controversial',
                      label: 'Include debated or controversial aspects',
                    },
                    {
                      value: 'technical',
                      label: 'Emphasize technical details and specifications',
                    },
                    {
                      value: 'conceptual',
                      label: 'Focus on high-level conceptual understanding',
                    },
                  ],
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
                  label: 'Learning Style',
                  controlLabel: 'Learning Style',
                  config: [
                    {
                      value: 'balanced',
                      label: 'Balanced for all learning styles',
                    },
                    {
                      value: 'visual',
                      label: 'Adapt for visual learners (examples, imagery)',
                    },
                    {
                      value: 'auditory',
                      label:
                        'Adapt for auditory learners (verbal descriptions)',
                    },
                    {
                      value: 'reading-writing',
                      label: 'Adapt for reading/writing preference',
                    },
                    {
                      value: 'kinesthetic',
                      label:
                        'Adapt for kinesthetic learners (practical scenarios)',
                    },
                    {
                      value: 'logical',
                      label: 'Adapt for logical/mathematical thinkers',
                    },
                    {
                      value: 'social',
                      label: 'Include collaborative or group contexts',
                    },
                    {
                      value: 'solitary',
                      label: 'Frame for individual study contexts',
                    },
                  ],
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
                  controlLabel: 'Difficulty Distribution',
                  config: [
                    {
                      value: 'balanced',
                      label:
                        'Balanced difficulty (33% easy, 34% medium, 33% hard)',
                    },
                    {
                      value: 'beginner-focused',
                      label:
                        'Beginner focused (50% easy, 30% medium, 20% hard)',
                    },
                    {
                      value: 'advanced-focused',
                      label:
                        'Advanced focused (20% easy, 30% medium, 50% hard)',
                    },
                    {
                      value: 'progressive',
                      label: 'Progressive difficulty (easier to harder)',
                    },
                    {
                      value: 'challenging',
                      label:
                        'Challenging throughout (10% easy, 40% medium, 50% hard)',
                    },
                    {
                      value: 'accessible',
                      label: 'More accessible (40% easy, 40% medium, 20% hard)',
                    },
                    {
                      value: 'expert',
                      label: 'Expert level (5% easy, 35% medium, 60% hard)',
                    },
                    {
                      value: 'introductory',
                      label:
                        'Introductory level (60% easy, 30% medium, 10% hard)',
                    },
                  ],
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
                  controlLabel: 'Card Length',
                  config: [
                    { value: 'balanced', label: 'Balanced length' },
                    {
                      value: 'concise',
                      label: 'Concise (shorter answers and explanations)',
                    },
                    {
                      value: 'detailed',
                      label:
                        'Detailed (comprehensive answers and explanations)',
                    },
                    {
                      value: 'very-concise',
                      label: 'Very concise (minimum effective information)',
                    },
                    {
                      value: 'comprehensive',
                      label: 'Comprehensive (thorough and extensive)',
                    },
                  ],
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
                  label: 'Mnemonic Preference',
                  controlLabel: 'Mnemonic Preference',
                  config: [
                    { value: 'none', label: 'No specific mnemonic techniques' },
                    { value: 'acronyms', label: 'Include helpful acronyms' },
                    {
                      value: 'associations',
                      label: 'Use association techniques',
                    },
                    { value: 'chunking', label: 'Employ information chunking' },
                    {
                      value: 'visualization',
                      label: 'Include visualization cues',
                    },
                    {
                      value: 'stories',
                      label: 'Use narrative/story techniques',
                    },
                    { value: 'rhymes', label: 'Include rhymes or wordplay' },
                    {
                      value: 'mind-palace',
                      label: 'Suggest memory palace techniques',
                    },
                    {
                      value: 'mixed',
                      label: 'Mix of different mnemonic techniques',
                    },
                  ],
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
