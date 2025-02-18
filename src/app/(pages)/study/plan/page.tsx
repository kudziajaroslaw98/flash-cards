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
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import type { Flashcard } from '#/types/flash-card.type';
import { useCompletion } from '@ai-sdk/react';
import { useCallback, useEffect, useState } from 'react';

export default function StudyPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
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

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedFlashcards, setSelectedFlashcards] = useState<Flashcard[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestedFlashcardType[]>(
    [],
  );
  const [selectedSuggestions, setSelectedSuggestions] = useState<
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
    setIsLoading(true);
    complete('prompt');
    // submit({
    //   focusTags: state.step1.focusTags,
    //   studyScope: state.step1.studyScope,
    //   knowledgeLevel: state.step1.knowledgeLevel,
    //   planType: state.step2.planType,
    //   duration: state.step2.duration,
    //   flashcardsNeeded:
    //     getRecomendedFlashcardCount(
    //       state.step2
    //         .duration as keyof (typeof recommendedFlashcardsCount)[keyof typeof recommendedFlashcardsCount],
    //       state.step2.planType as keyof typeof recommendedFlashcardsCount,
    //     )?.[1] ?? flashcards.length - flashcards.length,
    // });
  };
  // const { object, submit, isLoading } = useObject({
  //   api: API_ROUTES.GENERATE_SUGGESTED_FLASHCARDS,
  //   schema: z.array(
  //     z.object({
  //       id: z.string(),
  //       topic: z.string(),
  //       query: z.string(),
  //       context: z.string(),
  //       definition: z.string(),
  //       tags: z.array(z.string()),
  //       examples: z.string(),
  //       keyPoints: z.string(),
  //       synonyms: z.string(),
  //       relatedFacts: z.string(),
  //     }),
  //   ),
  // });
  const { complete, completion } = useCompletion({
    api: API_ROUTES.GENERATE_SUGGESTED_FLASHCARDS,
    body: {
      focusTags: state.step1.focusTags,
      studyScope: state.step1.studyScope,
      knowledgeLevel: state.step1.knowledgeLevel,
      planType: state.step2.planType,
      duration: state.step2.duration,
      flashcardsNeeded:
        getRecomendedFlashcardCount(
          state.step2
            .duration as keyof (typeof recommendedFlashcardsCount)[keyof typeof recommendedFlashcardsCount],
          state.step2.planType as keyof typeof recommendedFlashcardsCount,
        )?.[1] ?? flashcards.length - flashcards.length,
    },
    onFinish: () => {
      setIsLoading(false);
    },
  });

  // function extractObjects(text: string): Record<string, unknown>[] | null {
  //   const regex = '{(?:[^{}]|(?R))*}';
  //   const matches = text.match(regex);

  //   if (matches === null) {
  //     return null;
  //   }

  //   const mappedJson = matches?.map((match) => {
  //     console.log(match);
  //     return JSON.parse(match);
  //   });
  //   return mappedJson as Record<string, unknown>[];
  // }
  function extractObjects(str: string): Record<string, unknown>[] | null {
    console.log(str);
    const objects = [];
    let stack = [];
    let startIndex = -1;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') {
        if (stack.length === 0) startIndex = i;
        stack.push(i);
      } else if (str[i] === '}') {
        stack.pop();
        if (stack.length === 0 && startIndex !== -1) {
          objects.push(str.slice(startIndex, i + 1));
          startIndex = -1;
        }
      }
    }

    return objects?.map((match) => {
      console.log(match);
      return JSON.parse(match);
    });
  }

  useEffect(() => {
    const objects = extractObjects(completion);
    const suggestionsLength = suggestions.length;

    if (objects === null || suggestionsLength === objects?.length) {
      return;
    }

    // const startIndex = suggestionsLength === 0 ? 0 : suggestionsLength - 1;
    // const endIndex = objects.length - 1;

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

  // useEffect(() => {
  //   if (!object) return;
  //   console.log(object);
  //   setSuggestions(
  //     object
  //       ?.filter((flashcard) => flashcard)
  //       ?.map((flashcard) => ({
  //         type: 'single',
  //         ...flashcard,
  //       })) as AISuggestedFlashcardType[],
  //   );
  // }, [object]);

  const [suggestedSelectionMode, setSuggestedSelectionMode] = useState(false);

  const suggestedIsSelected = useCallback(
    (flashcard: AISuggestedFlashcardType) => {
      return (
        selectedSuggestions.findIndex((item) => item.id === flashcard.id) !== -1
      );
    },
    [selectedSuggestions],
  );

  const toggleSuggestionSelected = useCallback(
    (flashcard: AISuggestedFlashcardType) => {
      if (suggestedIsSelected(flashcard)) {
        setSelectedSuggestions((prev) =>
          prev.filter((item) => flashcard.id !== item.id),
        );
      } else {
        setSelectedSuggestions((prev) => [...prev, flashcard]);
      }
    },
    [suggestedIsSelected],
  );

  useEffect(() => {
    if (selectedSuggestions.length > 0) {
      setSuggestedSelectionMode(true);
    } else {
      setSuggestedSelectionMode(false);
    }
  }, [selectedSuggestions]);

  const acceptSelectedSuggestions = useCallback(() => {
    const mappedSuggestions = selectedSuggestions.map((suggestion) =>
      flashcardsMerge(defaultFlashcard, {
        ...suggestion,
        type: 'single',
      }),
    );
    setFlashcards((prev) => [...prev, ...mappedSuggestions]);
    setSuggestions((prev) => prev.filter((item) => !suggestedIsSelected(item)));
    setSelectedSuggestions([]);
  }, [selectedSuggestions]);

  const acceptAllSuggestions = useCallback(() => {
    const mappedSuggestions = suggestions.map((suggestion) =>
      flashcardsMerge(defaultFlashcard, {
        ...suggestion,
        type: 'single',
      }),
    );
    setFlashcards((prev) => [...prev, ...mappedSuggestions]);
    setSuggestions([]);
    setSelectedSuggestions([]);
  }, [suggestions]);

  const rejectAllSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestions([]);
  };

  const rejectSelectedSuggestions = () => {
    setSuggestions((prev) =>
      prev.filter(
        (suggestion) =>
          selectedSuggestions.findIndex((item) => item.id === suggestion.id) ===
          -1,
      ),
    );
    setSelectedSuggestions([]);
  };

  return (
    <div className='flex h-full w-full grow flex-col items-center gap-12 md:pb-12'>
      <StepperProvider>
        <Stepper>
          <StepperStep
            index={1}
            stepLabel='Study Goals'
            stepIdentificator='1'
          >
            <StudyPlanStep1
              state={state}
              setState={setState}
            />
          </StepperStep>

          <StepperStep
            index={2}
            stepLabel='Plan Type & Duration'
            stepIdentificator='2'
          >
            <StudyPlanStep2
              state={state}
              setState={setState}
              planTypes={planTypes}
              durations={durations}
            />
          </StepperStep>

          <StepperStep
            index={3}
            stepLabel='Review Picked Flashcards'
            stepIdentificator='3'
          >
            <StudyPlanStep3
              flashcards={flashcards}
              setFlashcards={setFlashcards}
              suggestions={suggestions}
              isLoading={isLoading}
              state={state}
              selectedFlashcards={selectedFlashcards}
              getRecomendedFlashcardCount={getRecomendedFlashcardCount}
              recommendedFlashcardsCount={recommendedFlashcardsCount}
              setSelectedFlashcards={setSelectedFlashcards}
              generateSuggestions={generateSuggestions}
            />
          </StepperStep>

          <StepperStep
            index={4}
            stepLabel='Generate & Customize Flashcards'
            stepIdentificator='3.1'
          >
            <StudyPlanStep4
              suggestions={suggestions}
              isLoading={isLoading}
              suggestedSelectionMode={suggestedSelectionMode}
              selectedSuggestions={selectedSuggestions}
              suggestedIsSelected={suggestedIsSelected}
              toggleSuggestionSelected={toggleSuggestionSelected}
              acceptSelectedSuggestions={acceptSelectedSuggestions}
              rejectSelectedSuggestions={rejectSelectedSuggestions}
              acceptAllSuggestions={acceptAllSuggestions}
              rejectAllSuggestions={rejectAllSuggestions}
            />
          </StepperStep>

          <StepperStep
            index={5}
            stepLabel='Generate & Review Study Plan'
            stepIdentificator='4'
          >
            <StudyPlanStep5 />
          </StepperStep>
        </Stepper>
      </StepperProvider>
    </div>
  );
}
