import { db } from '#/db/dexie.db';
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { ArrowRight, Check, CheckCheck, Eye, Pencil, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Button } from '../_ui/button/button';
import {
  AISuggestedFlashcard,
  type AISuggestedFlashcardType,
} from '../flash-card/ai-suggested-flashcard';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { useStepper } from '../stepper/stepper-context';

export function StudyPlanStep4({
  isLoading,
  suggestions,
  setSuggestions,
  setFlashcards,
}: {
  isLoading: boolean;
  suggestions: AISuggestedFlashcardType[];
  setFlashcards: Dispatch<SetStateAction<Flashcard[]>>;
  setSuggestions: Dispatch<SetStateAction<AISuggestedFlashcardType[]>>;
}) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    AISuggestedFlashcardType[]
  >([]);
  const [suggestedSelectionMode, setSuggestedSelectionMode] = useState(false);

  const { goToNext, goToPrev } = useStepper();

  const acceptSelectedSuggestions = useCallback(() => {
    const mappedSuggestions = selectedSuggestions.map((suggestion) =>
      flashcardsMerge(defaultFlashcard(), {
        ...suggestion,
        type: 'single',
      }),
    );
    setFlashcards((prev) => [...prev, ...mappedSuggestions]);
    setSuggestions((prev) => prev.filter((item) => !suggestedIsSelected(item)));
    setSelectedSuggestions([]);

    db.flashcards.bulkPut(mappedSuggestions);
  }, [selectedSuggestions]);

  const acceptAllSuggestions = useCallback(() => {
    const mappedSuggestions = suggestions.map((suggestion) =>
      flashcardsMerge(defaultFlashcard(), {
        ...suggestion,
        type: 'single',
      }),
    );
    setFlashcards((prev) => [...prev, ...mappedSuggestions]);
    setSuggestions([]);
    setSelectedSuggestions([]);

    db.flashcards.bulkPut(mappedSuggestions);
  }, [suggestions]);

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

  const handleContinueClick = () => {
    goToNext();
  };
  const handleGoBack = () => {
    goToPrev();
  };

  useEffect(() => {
    if (selectedSuggestions.length > 0) {
      setSuggestedSelectionMode(true);
    } else {
      setSuggestedSelectionMode(false);
    }
  }, [selectedSuggestions]);

  return (
    <div className='flex w-full flex-col items-start'>
      <h2 className='mb-4 text-2xl font-bold text-gray-700 dark:text-slate-400'>
        Review & Enhance Flashcards
      </h2>

      <p className='size-sm text-gray-500'>
        Click &apos;Generate Suggestions&apos; to get AI-powered flashcard
        ideas. Review, edit, and accept to personalize your study set.
      </p>

      <div className='flex w-full flex-col gap-6'>
        <div className='flex w-full flex-col gap-4'>
          {isLoading && (
            <span className='flex w-full animate-pulse justify-center py-4 text-lg'>
              Generating suggestions...
            </span>
          )}

          {suggestions.length > 0 && !isLoading && (
            <span className='text-sm'>
              Perfect, now accept suggestions to fill out the space before we
              continue
            </span>
          )}

          {suggestions.length === 0 && !isLoading && (
            <div className='flex w-full flex-col items-center justify-center gap-4 py-8'>
              <span className='max-w-sm text-center text-sm'>
                Looks like you have managed to clear the suggestions. Would you
                like to continue? or to take a look?
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
                <Button
                  icon={<Eye className='size-4' />}
                  iconPosition='right'
                  alt='Take a look'
                  label='Take a look'
                  onClick={handleGoBack}
                  disabled={isLoading}
                  variant={'secondary-outline'}
                  size='full'
                />
              </div>
            </div>
          )}

          <div
            className={cn([
              'grid h-auto w-full justify-center gap-4 transition-all',
              suggestions.length < 5 ? 'xl:justify-start' : 'xl:justify-center',
              'grid-cols-[repeat(auto-fit,11rem)]',
            ])}
          >
            <AnimatePresence mode='popLayout'>
              {suggestions.map((flashcard) => (
                <m.div
                  key={flashcard.id}
                  exit={{
                    maxHeight: 0,
                    height: 0,
                  }}
                  layout
                >
                  <AISuggestedFlashcard
                    flashcard={flashcard}
                    isInSelectionMode={suggestedSelectionMode}
                    onSelect={() => toggleSuggestionSelected(flashcard)}
                    isSelected={suggestedIsSelected(flashcard)}
                  />
                </m.div>
              ))}
            </AnimatePresence>
          </div>

          {suggestions.length > 0 && (
            <FloatingButtons className='w-full !px-1 py-4'>
              <AnimatePresence mode='popLayout'>
                {selectedSuggestions.length > 0 ? (
                  <m.div
                    key={'selected-suggestions'}
                    exit={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    initial={{ y: -10, opacity: 0 }}
                    className='flex w-full justify-center gap-2'
                  >
                    <Button
                      icon={<Check className='size-4' />}
                      alt='accept suggestion'
                      size='icon-square-sm'
                      onClick={acceptSelectedSuggestions}
                      disabled={isLoading}
                    />

                    <Button
                      icon={<Pencil className='size-4' />}
                      alt='edit suggestion'
                      variant={'secondary'}
                      size='icon-square-sm'
                      disabled={isLoading}
                    />

                    <Button
                      icon={<X className='size-4' />}
                      alt='reject suggestion'
                      variant={'destructive'}
                      size='icon-square-sm'
                      onClick={rejectSelectedSuggestions}
                      disabled={isLoading}
                    />
                  </m.div>
                ) : (
                  <m.div
                    key={'accept-all-suggestions'}
                    exit={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    initial={{ y: -10, opacity: 0 }}
                    className='flex w-full justify-center gap-4'
                  >
                    <Button
                      icon={<CheckCheck className='size-4' />}
                      alt='accept suggestion'
                      label='Accept All'
                      size={'sm'}
                      className='w-1/2'
                      onClick={acceptAllSuggestions}
                      disabled={isLoading}
                    />

                    <Button
                      icon={<X className='size-4' />}
                      alt='reject suggestion'
                      label='Reject All'
                      variant={'destructive'}
                      size='sm'
                      className='w-1/2'
                      onClick={rejectAllSuggestions}
                      disabled={isLoading}
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </FloatingButtons>
          )}
        </div>
      </div>
    </div>
  );
}
