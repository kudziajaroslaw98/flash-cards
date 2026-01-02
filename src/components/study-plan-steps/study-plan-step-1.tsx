'use client';

import type { PlanSetupState } from '#/app/(pages)/study/new/page';
import { cardLengthDictionary } from '#/dictionaries/card-length.dictionary';
import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { learningStyleDictionary } from '#/dictionaries/learning-style.dictionary';
import { mnemonicPreferenceDictionary } from '#/dictionaries/mnemonic-preference.dictionary';
import { useAIStream } from '#/hooks/use-ai-stream.hook';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { extractObjectsFromString } from '#/shared/utils/extract-objects-from-string';
import { isDifferent } from '#/shared/utils/is-different.util';
import type { CardLength } from '#/types/card-length.type';
import { DictionaryValue } from '#/types/dictionary-value.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import type { LearningStyleAdaptation } from '#/types/learning-style.type';
import type { MnemonicPreferences } from '#/types/mnemonic-preference.type';
import { ArrowRight } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<DictionaryValue<string>[]>([]);
  const [completion, setCompletion] = useState('');
  const { goToNext } = useStepper();
  const formRef = useRef<
    FormMethods<{
      focusTags: string[];
      knowledgeLevel: KnowledgeLevel;
      suggestedFocusAreas: string[];
      learningStyle?: LearningStyleAdaptation;
      cardLength?: CardLength;
      mnemonicPreference?: MnemonicPreferences;
    }>
  >(null);

  const { isStreaming, startStream } = useAIStream();

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

  const generateBrainstormIdeas = async (value: Partial<PlanSetupState['step1']>) => {
    if (!value.focusTags || value.focusTags.length === 0) {
      return;
    }

    if (!value.knowledgeLevel || value.knowledgeLevel === null) {
      return;
    }

    if (!isLoading && !isStreaming && isDifferent(value.focusTags, suggestions)) {
      setIsLoading(true);
      setCompletion('');

      try {
        await startStream(
          {
            api: API_ROUTES.GENERATE_BRAINSTORM_TAG_IDEAS,
            header: 'Brainstorming Tags',
            onChunk: (chunk) => {
              setCompletion(chunk.text);
            },
          },
          {
            focusTags: value.focusTags,
            knowledgeLevel: value.knowledgeLevel,
          }
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    generateBrainstormIdeas(state.step1);
  }, [state.step1.focusTags, state.step1.knowledgeLevel]);

  useEffect(() => {
    const objects =
      extractObjectsFromString<DictionaryValue<string>>(completion);
    const suggestionsLength = suggestions.length;

    if (objects === null || suggestionsLength === objects?.length) {
      return;
    }

    setSuggestions(objects);
  }, [completion]);

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
                    { value: 'Grammar', label: 'Grammar' },
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
                        .min(1, 'Tags are required')
                        .max(10, 'Max 10 tags'),
                    },
                  ],
                },
                suggestedFocusAreas: {
                  type: 'dropdown',
                  config: suggestions,
                  loading: isLoading,
                  multiple: true,
                  multipleLabel: 'Tags',
                  label: 'Choose tags...',
                  controlLabel: `Suggested tags for '${state.step1.knowledgeLevel}' level:`,
                  _internal_default_value: [],
                  _internal_constraints: [
                    {
                      type: 'validation',
                      key: 'suggestedFocusAreas',
                      constraint: z
                        .array(z.string().min(1))
                        .max(20, 'Max 20 tags')
                        .nullish(),
                    },
                    {
                      type: 'show',
                      key: 'knowledgeLevel',
                      constraint: knowledgeLevelSchema,
                    },
                  ],
                },
                _internal_group_title_1: {
                  type: '_internal_group_title',
                  title: 'Advanced Options',
                },
                _internal_accordion_1: {
                  type: '_internal_accordion',
                  title: 'Learning Style',
                  name: 'learningStyleSection',
                  inputs: {
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
