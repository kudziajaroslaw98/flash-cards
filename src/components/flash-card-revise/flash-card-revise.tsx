'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '#/components/_ui/button/button';
import { useAnswerHandler } from '#/hooks/use-answer-handler';
import { useFlashcardSession } from '#/hooks/use-flashcard-session';
import useKeyPress from '#/hooks/use-key-press.hook';
import useSpacedRepetition from '#/hooks/use-spaced-repetition';
import { useAppContext } from '#/providers/app-context';
import type { Flashcard } from '#/types/flash-card.type';
import { Check, RefreshCw } from 'lucide-react';
import Dropdown from '../_ui/dropdown/dropdown';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { AllRevisedView } from './all-revised-view';
import { EmptyFlashcardsView } from './empty-flashcards-view';
import { ReviseItem } from './revise-item';
import { ReviseOptions } from './revise-options';
import { SessionInfo } from './session-info';

const SPACED_REPETITION_OPTIONS = [
  { value: 'again', label: 'Again', description: 'Resetting card' },
  { value: 'hard', label: 'Hard', description: 'Review sooner' },
  { value: 'good', label: 'Good', description: 'Review on schedule' },
  { value: 'easy', label: 'Easy', description: 'Review later' },
] as const;

const DEFAULT_SET = { value: 'default', label: 'All flashcards' };

export default function FlashcardReviseComponent() {
  const { setsDictionary, flashcards, metadata, updateMetadata } =
    useAppContext();

  // Core state
  const [revisedSet, setRevisedSet] = useState<string>(DEFAULT_SET.value);
  const [revisedCard, setRevisedCard] = useState<Flashcard | undefined>();

  // Session tracking
  const session = useFlashcardSession();

  // Set-filtered flashcards
  const setFlashcards = useMemo(
    () =>
      revisedSet === DEFAULT_SET.value
        ? flashcards
        : flashcards.filter((flashcard) =>
            flashcard?.sets?.includes(revisedSet),
          ),
    [flashcards, revisedSet],
  );

  // Spaced repetition system
  const {
    reroll,
    calculateRepetition,
    randomItems,
    continueReroll,
    setContinueReroll,
    todayItems,
    availableTodayItems,
    sessionItemsCount,
  } = useSpacedRepetition({
    array: setFlashcards,
    revisedSetId: revisedSet,
    numberOfItems: 1,
  });

  // Answer handling
  const {
    answers,
    answersAvailable,
    clickedOption,
    clickedAnswer,
    clicked,
    isSelected,
    selectSpacedRepetitionRating,
    selectAnswer,
    handleConfirm,
    reset: resetAnswerState,
  } = useAnswerHandler({
    revisedCard,
    metadata,
    updateMetadata,
    session,
  });

  const handleReshuffle = async (key?: string) => {
    const trigger = key || 'button';
    window?.umami?.track('Reshuffle flashcards', { trigger, clicked });

    if (!clicked || !revisedCard || !clickedOption) return;

    try {
      await calculateRepetition(revisedCard, clickedOption);
      resetAnswerState();
      reroll(revisedCard.frontUuid);
    } catch (error) {
      console.error('Error during reshuffle:', error);
    }
  };

  const changeRevisedSet = (value: string) => {
    if (value !== revisedSet)
      window?.umami?.track('Change revised set', { value });
    // Resetting state when set changes
    resetAnswerState();
    setRevisedCard(undefined);
    setRevisedSet(value);
  };

  const continueRerollClick = () => {
    window?.umami?.track('Continue reshuffling');
    setRevisedCard(undefined);
    resetAnswerState();
    setContinueReroll(true);
  };

  const clickRevisedOption = (key: string) => {
    const index = parseInt(key) - 1;
    if (index < 0 || index > 3) return; // Invalid key

    if (answersAvailable) {
      selectAnswer(answers[index], key);
    } else if (!answersAvailable && index < SPACED_REPETITION_OPTIONS.length) {
      selectSpacedRepetitionRating(SPACED_REPETITION_OPTIONS[index].value);
    }
  };

  useEffect(() => {
    if (randomItems?.length > 0) {
      setRevisedCard(randomItems[0]);
      session.startCardTimer();
    } else {
      setRevisedCard(undefined);
    }
  }, [randomItems, session]);

  useKeyPress([' '], () =>
    clicked ? handleReshuffle('Space') : handleConfirm(),
  );
  useKeyPress(['ArrowRight'], () =>
    clicked ? handleReshuffle('ArrowRight') : handleConfirm(),
  );
  useKeyPress(['1'], () => clickRevisedOption('1'));
  useKeyPress(['2'], () => clickRevisedOption('2'));
  useKeyPress(['3'], () => clickRevisedOption('3'));
  useKeyPress(['4'], () => clickRevisedOption('4'));

  // Determine if there are cards available to revise
  const canRevise = randomItems && randomItems.length > 0 && revisedCard;
  // Determine if the session is completely finished (no items due, not continuing)
  const sessionFinished =
    availableTodayItems === 0 && !continueReroll && sessionItemsCount === 0;
  // Determine if user finished today's cards but could continue
  const finishedTodayCanContinue =
    availableTodayItems === 0 &&
    !continueReroll &&
    sessionItemsCount === 0 &&
    flashcards.length > 0;

  if (flashcards.length === 0) {
    return <EmptyFlashcardsView />;
  }

  // Completed state - all cards reviewed
  if (!canRevise && (finishedTodayCanContinue || sessionFinished)) {
    return <AllRevisedView onContinue={continueRerollClick} />;
  }

  return (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
        <SessionInfo
          totalCards={todayItems ?? 0}
          recalled={session.cardsRecalled.current}
          reviewed={session.cardsReviewed.current}
          timerStart={session.timerStart}
        />

        <ReviseItem revisedCard={revisedCard} />

        <ReviseOptions
          clicked={clicked}
          isSelected={isSelected}
          clickedOption={clickedOption}
          revisedCard={revisedCard}
          selectSpacedRepetitionRating={selectSpacedRepetitionRating}
          selectAnswer={selectAnswer}
          clickedAnswer={clickedAnswer}
          answers={answers}
          answersAvailable={answersAvailable}
        />
      </div>

      <FloatingButtons>
        <div className='flex w-full flex-col items-center justify-center gap-2 py-2'>
          <Button
            label={clicked ? 'Next Card' : 'Confirm Answer'}
            icon={
              clicked ? (
                <RefreshCw className='h-4 w-4' />
              ) : (
                <Check className='h-4 w-4' /> // Assuming you have a Check icon
              )
            }
            iconPosition={'right'}
            onClick={() => (clicked ? handleReshuffle() : handleConfirm())}
            size={'xlg'}
            className='!w-full !max-w-xs'
            disabled={!isSelected && !clicked}
            alt={
              clicked ? 'Proceed to next flashcard' : 'Confirm selected answer'
            }
          />

          {[DEFAULT_SET, ...setsDictionary].length > 1 && (
            <Dropdown
              type='dropdown'
              multiple={false}
              config={[DEFAULT_SET, ...setsDictionary]}
              onChange={changeRevisedSet}
              value={revisedSet}
              contextPosition='top'
              labelClassName='max-w-xs bg-gray-50 dark:bg-slate-950'
              disabled={[DEFAULT_SET, ...setsDictionary].length === 1}
            />
          )}
        </div>
      </FloatingButtons>
    </div>
  );
}
