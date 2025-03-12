'use client';

import { type AISuggestedFlashcardType } from '#/components/flash-card/ai-suggested-flashcard';
import { Stepper } from '#/components/stepper/stepper';
import { StepperProvider } from '#/components/stepper/stepper-context';
import { StepperStep } from '#/components/stepper/stepper-step';
import { StudyPlanStep1 } from '#/components/study-plan-steps/study-plan-step-1';
import { StudyPlanStep2 } from '#/components/study-plan-steps/study-plan-step-2';
import { StudyPlanStep3 } from '#/components/study-plan-steps/study-plan-step-3';
import { StudyPlanStep4 } from '#/components/study-plan-steps/study-plan-step-4';
import { StudyPlanStep5 } from '#/components/study-plan-steps/study-plan-step-5';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { extractObjectsFromString } from '#/shared/utils/extract-objects-from-string';
import type { CardLength } from '#/types/card-length.type';
import type { ContentEmphasis } from '#/types/content-emphasis.type';
import type { DifficultyDistribution } from '#/types/difficulty-distribution.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { KnowledgeLevel } from '#/types/knowledge-level.type';
import type { LearningStyleAdaptation } from '#/types/learning-style.type';
import type { MnemonicPreferences } from '#/types/mnemonic-preference.type';
import type { PlanDuration } from '#/types/plan-durations.type';
import type { PlanStudyScope } from '#/types/plan-study-scope.type';
import type { PlanType } from '#/types/plan-types.type';
import type { PreferredQuestionFormats } from '#/types/preferred-question-formats.type';
import { useCompletion } from '@ai-sdk/react';
import { useEffect, useState } from 'react';

export interface PlanSetupState {
  step1: {
    focusTags: string[];
    studyScope: PlanStudyScope;
    knowledgeLevel: KnowledgeLevel;
    preferredFormat?: PreferredQuestionFormats;
    contentEmphasis?: ContentEmphasis;
    learningStyle?: LearningStyleAdaptation;
    difficultyDistribution?: DifficultyDistribution;
    cardLength?: CardLength;
    mnemonicPreference?: MnemonicPreferences;
  };
  step2: {
    duration: PlanDuration;
    planType: PlanType;
  };
}

export default function NewStudyPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<PlanSetupState>({
    step1: {
      focusTags: [],
      studyScope: 'default',
      knowledgeLevel: 'beginner',
    },
    step2: {
      duration: '3',
      planType: 'overview',
    },
  });
  const recommendedFlashcardsCount: Record<
    PlanType,
    Record<PlanDuration, [number, number]>
  > = {
    overview: {
      '3': [30, 45],
      '5': [50, 75],
      '7': [70, 100],
      '14': [140, 200],
      '30': [300, 450],
    },
    'deep-dive': {
      '3': [25, 35],
      '5': [40, 60],
      '7': [60, 80],
      '14': [120, 160],
      '30': [250, 350],
    },
    'quick-review': {
      '3': [15, 25],
      '5': [25, 40],
      '7': [40, 60],
      '14': [80, 120],
      '30': [150, 250],
    },
    'exam-prep': {
      '3': [40, 50],
      '5': [60, 80],
      '7': [80, 120],
      '14': [160, 240],
      '30': [350, 500],
    },
  } as const;

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestedFlashcardType[]>(
    [],
  );

  const getRecommendedFlashcardCount = (
    duration: PlanDuration,
    planType: PlanType,
  ) => {
    return recommendedFlashcardsCount[planType ?? 'overview'][duration ?? '1'];
  };

  const generateSuggestions = () => {
    setIsLoading(true);
    complete('prompt');
  };

  const { complete, completion } = useCompletion({
    api: API_ROUTES.GENERATE_SUGGESTED_FLASHCARDS,
    body: {
      focusTags: state.step1.focusTags,
      studyScope: state.step1.studyScope,
      knowledgeLevel: state.step1.knowledgeLevel,
      planType: state.step2.planType,
      duration: state.step2.duration,
      flashcardsNeeded:
        getRecommendedFlashcardCount(
          state.step2.duration as PlanDuration,
          state.step2.planType as PlanType,
        )?.[1] ?? 0,
    },
    onFinish: () => {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const objects =
      extractObjectsFromString<AISuggestedFlashcardType>(completion);
    const suggestionsLength = suggestions.length;

    if (objects === null || suggestionsLength === objects?.length) {
      return;
    }

    console.log('🚀 ~ :119 ~ useEffect ~ objects:', objects);

    setSuggestions(
      objects.map(
        (element) =>
          ({
            ...element,
            type: 'single',
          }) as AISuggestedFlashcardType,
      ),
    );
  }, [completion]);

  return (
    <div className='flex h-full w-full grow flex-col items-center gap-12 md:pb-12'>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='w-52 text-green-400'>Create new plan</h4>
        </div>
      </div>
      <StepperProvider>
        <Stepper>
          <StepperStep
            index={1}
            stepLabel='Study Goals'
            stepIdentification='1'
          >
            <StudyPlanStep1
              state={state}
              setState={setState}
            />
          </StepperStep>

          <StepperStep
            index={2}
            stepLabel='Plan Type & Duration'
            stepIdentification='2'
          >
            <StudyPlanStep2
              state={state}
              setState={setState}
            />
          </StepperStep>

          <StepperStep
            index={3}
            stepLabel='Review Picked Flashcards'
            stepIdentification='3'
          >
            <StudyPlanStep3
              flashcards={flashcards}
              setFlashcards={setFlashcards}
              suggestions={suggestions}
              isLoading={isLoading}
              flashcardCount={getRecommendedFlashcardCount(
                state.step2.duration as PlanDuration,
                state.step2.planType as PlanType,
              )}
              generateSuggestions={generateSuggestions}
            />
          </StepperStep>

          <StepperStep
            index={4}
            stepLabel='Generate & Customize Flashcards'
            stepIdentification='3.1'
          >
            <StudyPlanStep4
              suggestions={suggestions}
              isLoading={isLoading}
              setSuggestions={setSuggestions}
              setFlashcards={setFlashcards}
            />
          </StepperStep>

          <StepperStep
            index={5}
            stepLabel='Generate & Review Study Plan'
            stepIdentification='4'
          >
            <StudyPlanStep5
              focusTags={state.step1.focusTags}
              flashcards={flashcards}
              summaries={flashcards.map((flashcard) => ({
                frontUuid: flashcard.frontUuid,
                context: flashcard.context,
                query: flashcard.query,
                definition: flashcard.definition,
              }))}
              planType={state.step2.planType}
              duration={state.step2.duration}
            />
          </StepperStep>
        </Stepper>
      </StepperProvider>
    </div>
  );
}
