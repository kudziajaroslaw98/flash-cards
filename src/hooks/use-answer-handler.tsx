import { db } from '#/db/dexie.db';
import uuid from '#/shared/utils/uuid.util';
import { Flashcard } from '#/types/flash-card.type';
import { FocusSession } from '#/types/focus-session.type';
import { Metadata } from '#/types/metadata.type';
import { ReviewLog } from '#/types/review-log.type';
import { ReviseOptionsType } from '#/types/revise-options.type';
import { RefObject, useCallback, useEffect, useState } from 'react';

export function useAnswerHandler({
  revisedCard,
  metadata,
  updateMetadata,
  session,
}: {
  revisedCard: Flashcard | undefined;
  metadata: Metadata;
  updateMetadata: (metadata: Metadata) => void;
  session: {
    cardsReviewed: RefObject<number>;
    cardsRecalled: RefObject<number>;
    focusSession: RefObject<FocusSession>;
    cardTime: RefObject<Date>;
    timerStart: RefObject<Date | null>;
    startCardTimer: () => void;
    incrementRecalled: () => void;
    incrementReviewed: () => void;
  };
}) {
  const [clickedOption, setClickedOption] = useState<
    ReviseOptionsType | undefined
  >();
  const [clickedAnswer, setClickedAnswer] = useState<string | undefined>();
  const [clicked, setClicked] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answersAvailable, setAnswersAvailable] = useState<boolean>(false);

  // Set up answers when card changes
  useEffect(() => {
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

  const handleConfirm = useCallback(() => {
    if (!isSelected || !revisedCard || clicked) return;

    window?.umami?.track('Answer confirmed');

    const clonedStats = { ...metadata };
    const reviewLog: ReviewLog = {
      frontUuid: uuid(),
      timestamp: new Date().toISOString(),
      sessionUuid: session.focusSession.current.frontUuid,
      cardFrontUuid: revisedCard.frontUuid,
      recalled: false,
      timeSpent: Math.floor(
        (Date.now() - session.cardTime.current.getTime()) / 1000,
      ),
      tags: revisedCard.tags,
      synced: false,
    };

    let finalReviseOption: ReviseOptionsType | undefined = clickedOption;

    if (answersAvailable) {
      // Multiple choice answers
      const correct = revisedCard?.answer1 === clickedAnswer;
      reviewLog.recalled = correct;
      clonedStats.correctAnswers += correct ? 1 : 0;
      if (correct) session.incrementRecalled();
      clonedStats.incorrectAnswers += correct ? 0 : 1;
      finalReviseOption = correct ? 'easy' : 'again';
    } else {
      // Self-rated spaced repetition
      const isCorrect = finalReviseOption !== 'again';
      reviewLog.recalled = isCorrect;
      clonedStats.correctAnswers += isCorrect ? 1 : 0;
      clonedStats.incorrectAnswers += isCorrect ? 0 : 1;
      if (isCorrect) session.incrementRecalled();
    }

    session.incrementReviewed();
    clonedStats.answers += 1;
    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    db.reviewLogs.add(reviewLog);
    updateMetadata({ ...clonedStats });
    setClickedOption(finalReviseOption);
    setClicked(true);
  }, [
    isSelected,
    revisedCard,
    clicked,
    clickedOption,
    clickedAnswer,
    answersAvailable,
    metadata,
    updateMetadata,
    session,
  ]);

  const reset = useCallback(() => {
    setClickedOption(undefined);
    setClickedAnswer(undefined);
    setClicked(false);
    setIsSelected(false);
  }, []);

  return {
    clickedOption,
    clickedAnswer,
    clicked,
    isSelected,
    answers,
    answersAvailable,
    selectSpacedRepetitionRating,
    selectAnswer,
    handleConfirm,
    reset,
  };
}
