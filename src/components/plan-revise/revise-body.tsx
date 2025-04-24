import { db } from '#/db/dexie.db';
import { useFlashcardSession } from '#/hooks/use-flashcard-session';
import useKeyPress from '#/hooks/use-key-press.hook';
import { useAppContext } from '#/providers/app-context';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import uuid from '#/shared/utils/uuid.util';
import type { Flashcard } from '#/types/flash-card.type';
import { ReviewLog } from '#/types/review-log.type';
import type { ReviseOptionsType } from '#/types/revise-options.type';
import { Check, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import ProgressBar from '../_ui/progress-bar/progress-bar';
import { ReviseItem } from '../flash-card-revise/revise-item';
import { ReviseOptions } from '../flash-card-revise/revise-options';
import { FloatingButtons } from '../floating-buttons/floating-buttons';

const SPACED_REPETITION_OPTIONS = [
  { value: 'again', label: 'Again', description: 'Resetting card' },
  { value: 'hard', label: 'Hard', description: 'Review sooner' },
  { value: 'good', label: 'Good', description: 'Review on schedule' },
  { value: 'easy', label: 'Easy', description: 'Review later' },
] as const;

export function ReviseBody({
  clicked,
  setClicked,
  revisedCard,
  handleReshuffle,
}: {
  clicked: boolean;
  setClicked: (value: boolean) => void;
  revisedCard: Flashcard | undefined;
  handleReshuffle: (key?: string) => void;
}) {
  const [clickedOption, setClickedOption] = useState<
    ReviseOptionsType | undefined
  >();
  const [clickedAnswer, setClickedAnswer] = useState<string | undefined>();
  const [isSelected, setIsSelected] = useState(false); // Track if an option is selected *before* confirm

  const [answers, setAnswers] = useState<string[]>([]);
  const [answersAvailable, setAnswersAvailable] = useState<boolean>(false);

  const { currentDay, currentSession } = useRevisePlanContext();
  // Integrate session tracking from the hook
  const session = useFlashcardSession();
  // Get metadata context if needed for updates
  const { metadata, updateMetadata } = useAppContext();

  // Calculate session stats based on context and hook refs
  const reviewedCards = currentSession?.completedCards.length ?? 0;
  const recalledCards = currentDay?.correctCards.length ?? 0; // Use correctCards from StudyDay
  const totalCards =
    (currentDay?.cardsToReview.length ?? 0) +
    (currentDay?.newCards.length ?? 0);

  // Reset local state when the card changes
  useEffect(() => {
    setIsSelected(false);
    setClickedOption(undefined);
    setClickedAnswer(undefined);
    if (revisedCard) {
      session.startCardTimer(); // Start timer for the new card
    }
  }, [revisedCard, session.startCardTimer]);

  // Handler for selecting a spaced repetition rating (Again, Hard, Good, Easy)
  const handleSpacedRepetitionSelect = useCallback(
    (value: ReviseOptionsType) => {
      if (clicked || !revisedCard) return;
      window?.umami?.track('Space repetition selected', { value });
      setClickedOption(value); // Store the selected *rating*
      setClickedAnswer(undefined); // Ensure no answer is marked as selected
      setIsSelected(true); // Mark that an option has been selected
    },
    [clicked, revisedCard],
  );

  // Handler for selecting a multiple-choice answer
  const handleAnswerSelect = useCallback(
    (answer: string | undefined, key?: string) => {
      if (!answer || !revisedCard || clicked) return;
      window?.umami?.track('Answer selected', { key: key || null });
      setClickedAnswer(answer); // Store the selected *answer*
      setClickedOption(undefined); // Ensure no rating is marked as selected
      setIsSelected(true); // Mark that an option has been selected
    },
    [clicked, revisedCard],
  );

  const selectSpacedRepetitionRating = useCallback(
    (value: ReviseOptionsType) => {
      if (clicked || !revisedCard) return;

      window?.umami?.track('Space repetition selected', { value });
      setClickedOption(value);
      setIsSelected(true);
    },
    [clicked, revisedCard],
  );

  const selectAnswer = useCallback(
    (answer: string, key?: string) => {
      if (clicked || !answer || !revisedCard) return;

      window?.umami?.track('Answer selected', { key: key || null });
      setClickedAnswer(answer);
      setIsSelected(true);
    },
    [clicked, revisedCard],
  );

  // Set up answers when card changes
  useEffect(() => {
    if (!revisedCard) return;

    const cardAnswers = [
      revisedCard?.answer1 ?? null,
      revisedCard?.answer2 ?? null,
      revisedCard?.answer3 ?? null,
      revisedCard?.answer4 ?? null,
    ]
      .filter((answer) => answer !== null && answer !== '')
      .sort(() => Math.random() - 0.5) as string[];

    setAnswers(cardAnswers);
    setAnswersAvailable(cardAnswers.length > 0);
  }, [revisedCard]);

  // Handler for confirming the selection (either an answer or a rating)
  const handleConfirm = useCallback(async () => {
    if (
      !isSelected ||
      !revisedCard ||
      !currentDay ||
      !currentSession ||
      clicked
    )
      return;

    window?.umami?.track('Answer confirmed');

    const cardEndTime = new Date();
    const timeSpent = session.cardTime.current
      ? Math.floor(
          (cardEndTime.getTime() - session.cardTime.current.getTime()) / 1000,
        )
      : 0;

    let isCorrect = false;
    let finalReviseOption: ReviseOptionsType;

    if (clickedAnswer !== undefined) {
      // Multiple choice answer was selected
      isCorrect = revisedCard.answer1 === clickedAnswer;
      finalReviseOption = isCorrect ? 'easy' : 'again'; // Determine rating based on correctness
    } else if (clickedOption !== undefined) {
      // Self-rated spaced repetition option was selected
      isCorrect = clickedOption !== 'again'; // Assume 'hard', 'good', 'easy' are correct recalls
      finalReviseOption = clickedOption;
    } else {
      console.error('Confirmation attempted without selection.');
      return; // Should not happen if isSelected is true
    }

    // --- Database Updates ---
    const updatePromises = [];

    // 1. Update StudyDay (correct/incorrect lists)
    const dayUpdate = {
      correctCards: isCorrect
        ? [...new Set([...currentDay.correctCards, revisedCard.frontUuid])]
        : currentDay.correctCards.filter((id) => id !== revisedCard.frontUuid), // Ensure removal if switching from correct to incorrect
      incorrectCards: !isCorrect
        ? [...new Set([...currentDay.incorrectCards, revisedCard.frontUuid])]
        : currentDay.incorrectCards.filter(
            (id) => id !== revisedCard.frontUuid,
          ), // Ensure removal if switching
    };
    updatePromises.push(db.studyDays.update(currentDay.frontUuid, dayUpdate));

    // 2. Update StudySession (add to completed cards)
    const sessionUpdate = {
      completedCards: [
        ...new Set([...currentSession.completedCards, revisedCard.frontUuid]),
      ],
    };
    updatePromises.push(
      db.studySessions.update(currentSession.frontUuid, sessionUpdate),
    );

    // 3. Add Review Log
    const reviewLog: ReviewLog = {
      frontUuid: uuid(),
      timestamp: cardEndTime.toISOString(),
      sessionUuid: session.focusSession.current.frontUuid, // Use session ID from hook
      cardFrontUuid: revisedCard.frontUuid,
      recalled: isCorrect,
      timeSpent: timeSpent,
      tags: revisedCard.tags || [],
      synced: false,
    };
    updatePromises.push(db.reviewLogs.add(reviewLog));

    // --- Metadata Update (Optional - Consider if needed here or at session end) ---
    // const clonedStats = { ...metadata };
    // clonedStats.answers += 1;
    // clonedStats.correctAnswers += isCorrect ? 1 : 0;
    // clonedStats.incorrectAnswers += !isCorrect ? 1 : 0;
    // clonedStats.accuracy = parseFloat(
    //   (clonedStats.correctAnswers / clonedStats.answers).toFixed(2) || '0',
    // );
    // updatePromises.push(updateMetadata({ ...clonedStats })); // Consider batching metadata updates

    // --- Session Hook Updates ---
    session.incrementReviewed();
    if (isCorrect) {
      session.incrementRecalled();
    }

    // Execute all updates
    await Promise.all(updatePromises);

    // Set the final state for UI feedback
    setClickedOption(finalReviseOption); // Reflect the determined rating visually
    setClicked(true); // Lock the options
  }, [
    isSelected,
    revisedCard,
    currentDay,
    currentSession,
    clicked,
    clickedAnswer,
    clickedOption,
    metadata,
    updateMetadata,
    session,
    setIsSelected,
    setClicked,
    setClickedOption,
  ]);

  const clickRevisedOption = (key: string) => {
    const index = parseInt(key) - 1;
    if (index < 0 || index > 3) return; // Invalid key

    if (answersAvailable) {
      selectAnswer(answers[index], key);
    } else if (!answersAvailable && index < SPACED_REPETITION_OPTIONS.length) {
      selectSpacedRepetitionRating(SPACED_REPETITION_OPTIONS[index].value);
    }
  };

  const handleReshuffleWrapper = () => {
    handleReshuffle();
    setClickedOption(undefined);
    setClickedAnswer(undefined);
    setClicked(false);
    setIsSelected(false);
  };
  useKeyPress([' '], () =>
    clicked ? handleReshuffleWrapper() : handleConfirm(),
  );
  useKeyPress(['ArrowRight'], () =>
    clicked ? handleReshuffleWrapper() : handleConfirm(),
  );
  useKeyPress(['1'], () => clickRevisedOption('1'));
  useKeyPress(['2'], () => clickRevisedOption('2'));
  useKeyPress(['3'], () => clickRevisedOption('3'));
  useKeyPress(['4'], () => clickRevisedOption('4'));

  return (
    <>
      <div className='flex flex-col gap-4'>
        <div className='grid h-full w-full flex-col items-center justify-center gap-3'>
          <div className='flex items-center justify-start'>
            <h6 className='text-sm text-gray-600 dark:text-slate-200'>
              Plan Session summary
            </h6>
          </div>

          <div className='flex flex-wrap justify-between gap-3 text-xs text-gray-600 dark:text-slate-400'>
            <span>
              <span>Total cards:</span>{' '}
              <span className='font-semibold'>{totalCards}</span>
            </span>

            <span>
              <span>Reviewed cards:</span>{' '}
              <span className='font-semibold'>{reviewedCards}</span>
            </span>

            <span>
              <span>Recalled:</span>{' '}
              <span className='font-semibold'>{recalledCards}</span>
            </span>
          </div>

          <ProgressBar
            value={reviewedCards}
            max={totalCards}
          />
        </div>
      </div>

      <ReviseItem revisedCard={revisedCard} />

      <ReviseOptions
        clicked={clicked}
        isSelected={isSelected}
        clickedOption={clickedOption}
        clickedAnswer={clickedAnswer}
        revisedCard={revisedCard}
        selectSpacedRepetitionRating={handleSpacedRepetitionSelect}
        selectAnswer={handleAnswerSelect}
        answersAvailable={answersAvailable}
        answers={answers}
        // Pass handleConfirm to ReviseOptions if the confirm button is there
        // Alternatively, keep the confirm button outside ReviseOptions
      />

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
            onClick={() =>
              clicked ? handleReshuffleWrapper() : handleConfirm()
            }
            size={'xlg'}
            className='!w-full !max-w-xs'
            disabled={!isSelected && !clicked}
            alt={
              clicked ? 'Proceed to next flashcard' : 'Confirm selected answer'
            }
          />
        </div>
      </FloatingButtons>
    </>
  );
}
