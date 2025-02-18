'use client';

import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import type { AISuggestedFlashcardType } from '../flash-card/ai-suggested-flashcard';
import FlashcardComponent from '../flash-card/flash-card';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep3({
  flashcards,
  suggestions,
  isLoading,
  state,
  setFlashcards,
  selectedFlashcards,
  recommendedFlashcardsCount,
  getRecomendedFlashcardCount,
  setSelectedFlashcards,
  generateSuggestions,
}: {
  flashcards: Flashcard[];
  suggestions: AISuggestedFlashcardType[];
  isLoading: boolean;
  state: any;
  selectedFlashcards: Flashcard[];
  recommendedFlashcardsCount: any;
  getRecomendedFlashcardCount: (duration: any, planType: any) => number[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setSelectedFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  generateSuggestions: () => void;
}) {
  const { goToIndex } = useStepper();
  const [flashcardsSelectionMode, setFlashcardsSelectionMode] = useState(false);

  const rejectAllFlashcards = () => {
    setFlashcards([]);
  };

  const rejectSelectedFlashcards = () => {
    setFlashcards((prev) =>
      prev.filter(
        (flashcard) =>
          selectedFlashcards.findIndex(
            (item) => item.frontUuid === flashcard.frontUuid,
          ) === -1,
      ),
    );
  };

  const flashcardIsSelected = useCallback(
    (flashcard: Flashcard) => {
      return (
        selectedFlashcards.findIndex(
          (item) => item.frontUuid === flashcard.frontUuid,
        ) !== -1
      );
    },
    [selectedFlashcards],
  );

  const toggleFlashcardSelected = useCallback(
    (flashcard: Flashcard) => {
      if (flashcardIsSelected(flashcard)) {
        setSelectedFlashcards((prev) =>
          prev.filter((item) => item.frontUuid !== flashcard.frontUuid),
        );
      } else {
        setSelectedFlashcards((prev) => [...prev, flashcard]);
      }
    },
    [flashcardIsSelected],
  );

  useEffect(() => {
    if (selectedFlashcards.length > 0) {
      setFlashcardsSelectionMode(true);
    } else {
      setFlashcardsSelectionMode(false);
    }
  }, [selectedFlashcards]);

  const handleContinueClick = () => {
    goToIndex(5);
  };

  return (
    <div className='flex w-full flex-col items-start'>
      <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
        Review Picked Flashcards
      </h2>

      <p className='size-sm text-gray-500'>
        Review flashcards picked by AI and reject the ones that do not match
        your vision for this plan.
      </p>

      <div className='flex w-full flex-col gap-6'>
        <div className='flex gap-4 pt-1'>
          <span className='text-xs'>
            Flashcards Selected: {flashcards.length}
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

        <div className='flex w-full justify-center'>
          {flashcards.length === 0 && (
            <div className='flex max-w-96 flex-col items-center justify-center gap-6 text-center'>
              {suggestions.length === 0 && (
                <span className='text-sm'>
                  Looks like you don&apos;t have minimum required flashcards for
                  effective plan generation. We highly recommend you to fill out
                  space with generated flashcards
                </span>
              )}

              <Button
                alt='generateFlashcards'
                label='Generate Suggestions'
                icon={<Sparkles className='size-4' />}
                onClick={() => {
                  generateSuggestions();
                  goToIndex(4);
                }}
                loading={isLoading}
                disabled={suggestions.length > 0}
              />
            </div>
          )}

          {suggestions.length === 0 &&
            !isLoading &&
            flashcards.length >
              getRecomendedFlashcardCount(
                state?.step2?.duration,
                state?.step2?.planType,
              )[0] && (
              <div className='flex w-full flex-col items-center justify-center gap-4 py-8'>
                <span className='max-w-sm text-center text-sm'>
                  Alrighty, this is a list of your flashcards for this plan.
                  Feel free to continue when you are done.
                </span>

                <div className='flex w-full max-w-64 flex-col gap-4'>
                  <Button
                    icon={<ArrowRight className='size-4' />}
                    alt='Continue to next step'
                    label='Continue'
                    iconPosition='right'
                    onClick={handleContinueClick}
                    disabled={isLoading}
                    size='full'
                  />
                </div>
              </div>
            )}
        </div>

        <div className='flex flex-col gap-2'>
          <span>Your flashcards: </span>
        </div>

        <div
          className={cn([
            'grid h-auto w-full justify-center gap-4 transition-all',
            flashcards.length < 5 ? 'xl:justify-start' : 'xl:justify-center',
            'grid-cols-[repeat(auto-fit,9rem)]',
          ])}
        >
          <AnimatePresence mode='popLayout'>
            {flashcards.map((flashcard) => (
              <m.div
                key={flashcard.frontUuid}
                exit={{
                  maxHeight: 0,
                  height: 0,
                }}
                layout
              >
                <FlashcardComponent
                  size='sm'
                  key={flashcard?.frontUuid}
                  flashcard={flashcard}
                  isInSelectionMode={flashcardsSelectionMode}
                  onSelect={() => toggleFlashcardSelected(flashcard)}
                  isSelected={flashcardIsSelected(flashcard)}
                />
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        {suggestions.length === 0 &&
          !isLoading &&
          flashcards.length >
            getRecomendedFlashcardCount(
              state?.step2?.duration,
              state?.step2?.planType,
            )[0] && (
            <div className='flex w-full flex-col items-center justify-center gap-4 py-8'>
              <span className='max-w-sm text-center text-sm'>
                Don&apos; worry we got you, continue is also here for you
              </span>

              <div className='flex w-full max-w-64 flex-col gap-4'>
                <Button
                  icon={<ArrowRight className='size-4' />}
                  alt='Continue to next step'
                  label='Continue'
                  iconPosition='right'
                  onClick={handleContinueClick}
                  disabled={isLoading}
                  size='full'
                />
              </div>
            </div>
          )}

        {flashcards.length > 0 &&
          flashcards.length <
            getRecomendedFlashcardCount(
              state?.step2?.duration,
              state?.step2?.planType,
            )[0] && (
            <FloatingButtons className='flex-row gap-2'>
              {selectedFlashcards.length > 0 ? (
                <>
                  <Button
                    icon={<X className='size-4' />}
                    alt='reject suggestion'
                    variant={'destructive'}
                    size='icon-square'
                    onClick={rejectSelectedFlashcards}
                    disabled={isLoading}
                  />
                </>
              ) : (
                <>
                  <Button
                    icon={<X className='size-4' />}
                    alt='reject suggestion'
                    label='Reject All'
                    variant={'destructive'}
                    size='sm'
                    className='w-1/2'
                    onClick={rejectAllFlashcards}
                    disabled={isLoading}
                  />
                </>
              )}
            </FloatingButtons>
          )}
      </div>
    </div>
  );
}
