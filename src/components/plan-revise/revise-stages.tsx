// import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import { useEffect, useState } from 'react';
import { Case } from '../_ui/switch-case/case';
import { SwitchCase } from '../_ui/switch-case/switch-case';
import { ReviseAllStage } from './revise-all-stage';
import { ReviseIncorrectSummary } from './revise-incorrect-summary';
import { ReviseNewStage } from './revise-new-stage';
import { ReviseOldStage } from './revise-old-stage';

export function ReviseStages() {
  const {
    reviseStage: stage,
    setReviseStage: setStage,
    currentDay,
    reviewFlashcards,
    newFlashcards,
  } = useRevisePlanContext();

  const [reviewCorrect, setReviewCorrect] = useState<string[]>([]);
  const [reviewIncorrect, setReviewIncorrect] = useState<string[]>([]);
  const [newCorrect, setNewCorrect] = useState<string[]>([]);
  const [newIncorrect, setNewIncorrect] = useState<string[]>([]);

  useEffect(() => {
    if (!currentDay) {
      return;
    }

    if (currentDay.correctCards.length > 0) {
      const reviewCorrect: string[] = [];
      const newCorrect: string[] = [];

      currentDay.correctCards.forEach((card) => {
        if (currentDay.cardsToReview.some((c) => c === card)) {
          reviewCorrect.push(card);
        } else {
          newCorrect.push(card);
        }
      });

      setNewCorrect(newCorrect);
      setReviewCorrect(reviewCorrect);
    }
  }, [currentDay, currentDay?.correctCards]);

  useEffect(() => {
    if (!currentDay) {
      return;
    }

    if (currentDay.incorrectCards.length > 0) {
      const reviewIncorrect: string[] = [];
      const newIncorrect: string[] = [];

      currentDay.incorrectCards.forEach((card) => {
        if (currentDay.cardsToReview.some((c) => c === card)) {
          reviewIncorrect.push(card);
        } else {
          newIncorrect.push(card);
        }
      });

      setReviewIncorrect(reviewIncorrect);
      setNewIncorrect(newIncorrect);
    }
  }, [currentDay, currentDay?.incorrectCards]);

  return (
    <SwitchCase condition={stage}>
      <Case caseValue={1}>
        <ReviseOldStage />
      </Case>

      <Case caseValue={2}>
        <ReviseIncorrectSummary
          cardsCount={reviewFlashcards.length}
          correctCount={reviewCorrect.length}
          incorrectCount={reviewIncorrect.length}
          retention={reviewCorrect.length / reviewFlashcards.length}
          flashcards={reviewFlashcards}
          incorrectFlashcards={reviewIncorrect}
          onContinue={() => setStage(3)}
        />
      </Case>

      <Case caseValue={3}>
        <ReviseNewStage />
      </Case>

      <Case caseValue={4}>
        <ReviseIncorrectSummary
          cardsCount={newFlashcards.length}
          correctCount={newCorrect.length}
          incorrectCount={newIncorrect.length}
          retention={newCorrect.length / newFlashcards.length}
          flashcards={newFlashcards}
          incorrectFlashcards={newIncorrect}
          onContinue={() => {
            setStage(5);
          }}
        />
      </Case>

      <Case caseValue={5}>
        <ReviseAllStage />
      </Case>
    </SwitchCase>
  );
}
