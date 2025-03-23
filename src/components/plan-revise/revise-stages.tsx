import type { Flashcard } from '#/types/flash-card.type';
// import { experimental_useObject as useObject } from '@ai-sdk/react';
import { db } from '#/db/dexie.db';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import { Case } from '../_ui/switch-case/case';
import { SwitchCase } from '../_ui/switch-case/switch-case';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ReviseBody } from './revise-body';
import { ReviseIncorrectSummary } from './revise-incorrect-summary';

export function ReviseStages({
  clicked,
  setClicked,
}: {
  clicked: boolean;
  setClicked: (value: boolean) => void;
}) {
  const {
    reviseStage: stage,
    setReviseStage: setStage,
    completedFlashcards: completed,
    currentDay,
    currentSession,
    reviewFlashcards,
    newFlashcards,
  } = useRevisePlanContext();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [revisedCard, setRevisedCard] = useState<Flashcard>();

  const [reviewCompleted, setReviewCompleted] = useState<Flashcard[]>([]);
  const [reviewCorrect, setReviewCorrect] = useState<string[]>([]);
  const [reviewIncorrect, setReviewIncorrect] = useState<string[]>([]);

  const [newCompleted, setNewCompleted] = useState<Flashcard[]>([]);
  const [newCorrect, setNewCorrect] = useState<string[]>([]);
  const [newIncorrect, setNewIncorrect] = useState<string[]>([]);

  const reroll = () => {
    if (!clicked || !revisedCard) return;

    const leftCards = flashcards.filter((card) =>
      completed?.every((c) => c.frontUuid !== card.frontUuid),
    );

    if (leftCards.length === 0) {
      setStage((prev) => prev + 1);
    }

    setRevisedCard(leftCards[0]);
    setClicked(false);
  };

  useEffect(() => {
    if (revisedCard || flashcards.length === 0) {
      return;
    }
    const leftCards = flashcards.filter((card) =>
      completed?.every((c) => c.frontUuid !== card.frontUuid),
    );
    setRevisedCard(leftCards[0]);
    setClicked(false);
  }, [revisedCard, currentDay, completed, flashcards]);

  useEffect(() => {
    if (!currentDay) {
      return;
    }

    if (currentDay.correctCards.length > 0) {
      const reviewCorrect = currentDay.correctCards.filter((card) =>
        currentDay.cardsToReview.some((c) => c === card),
      );
      const newCorrect = currentDay.correctCards.filter((card) =>
        currentDay.newCards.some((c) => c === card),
      );
      setNewCorrect(newCorrect);
      setReviewCorrect(reviewCorrect);
    }
  }, [currentDay, currentDay?.correctCards]);

  useEffect(() => {
    if (!currentDay) {
      return;
    }

    if (currentDay.incorrectCards.length > 0) {
      const reviewIncorrect = currentDay.incorrectCards.filter((card) =>
        currentDay.cardsToReview.some((c) => c === card),
      );
      const newIncorrect = currentDay.incorrectCards.filter((card) =>
        currentDay.newCards.some((c) => c === card),
      );
      setReviewIncorrect(reviewIncorrect);
      setNewIncorrect(newIncorrect);
    }
  }, [currentDay, currentDay?.incorrectCards]);

  useEffect(() => {
    if (!reviewFlashcards || !newFlashcards || clicked) {
      return;
    }

    let newStage = stage;

    // all reviewed
    if (
      stage === 1 &&
      reviewFlashcards.length > 0 &&
      reviewFlashcards.length === reviewCompleted.length
    ) {
      if (reviewIncorrect.length > 0) {
        newStage = 2;
      } else {
        newStage = 3;
      }
    }

    // all new
    if (
      stage === 3 &&
      newFlashcards.length > 0 &&
      newFlashcards.length === newCompleted.length
    ) {
      if (newIncorrect.length > 0) {
        newStage = 4;
      } else {
        newStage = 5;
      }
    }

    if (newStage !== stage && newStage !== 6) {
      setStage(newStage);
    }
  }, [reviewFlashcards, newFlashcards, reviewCompleted, newCompleted]);

  useEffect(() => {
    if (!reviewFlashcards || !newFlashcards || !completed) {
      return;
    }

    const reviewCompleted: Flashcard[] = [];
    const newCompleted: Flashcard[] = [];

    completed.forEach((card) => {
      if (reviewFlashcards.find((f) => f.frontUuid === card.frontUuid)) {
        reviewCompleted.push(card);
      } else if (newFlashcards.find((f) => f.frontUuid === card.frontUuid)) {
        newCompleted.push(card);
      }
    });

    setReviewCompleted(reviewCompleted);
    setNewCompleted(newCompleted);
  }, [reviewFlashcards, newFlashcards, completed]);

  useEffect(() => {
    if (revisedCard || !currentSession || !currentDay) {
      return;
    }

    const allFlashcards = [...reviewFlashcards, ...newFlashcards];
    const allIncorrect = [...reviewIncorrect, ...newIncorrect];

    switch (stage) {
      case 1:
        setFlashcards(reviewFlashcards);
        break;
      case 3:
        setFlashcards(newFlashcards);
        break;
      case 5:
        setFlashcards(allFlashcards);
        db.studySessions.update(currentSession.frontUuid, {
          completedCards: currentSession.completedCards.filter(
            (c) => !allIncorrect.includes(c),
          ),
        });
        db.studyDays.update(currentDay.frontUuid, {
          incorrectCards: [],
        });

        if (allIncorrect.length === 0) {
          setStage(6);
        }
        break;
    }
  }, [stage, reviewFlashcards, newFlashcards]);

  return (
    <SwitchCase condition={stage}>
      <Case caseValue={1}>
        <span>Review Cards</span>
        <ReviseBody
          clicked={clicked}
          setClicked={setClicked}
          revisedCard={revisedCard}
        />
        <FloatingButtons>
          <div className='flex w-full flex-col items-center justify-center gap-2 py-2'>
            <Button
              label={'Next'}
              icon={<ArrowRight className='h-4 w-4' />}
              iconPosition={'right'}
              onClick={reroll}
              size={'xlg'}
              className='!w-full !max-w-xs'
              disabled={!clicked}
              alt='Next'
            />
          </div>
        </FloatingButtons>
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
        <span>New Cards</span>
        <ReviseBody
          clicked={clicked}
          setClicked={setClicked}
          revisedCard={revisedCard}
        />
        <FloatingButtons>
          <div className='flex w-full flex-col items-center justify-center gap-2 py-2'>
            <Button
              label={'Next'}
              icon={<ArrowRight className='h-4 w-4' />}
              iconPosition={'right'}
              onClick={reroll}
              size={'xlg'}
              className='!w-full !max-w-xs'
              disabled={!clicked}
              alt='Next'
            />
          </div>
        </FloatingButtons>
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
        <span>Revise All Incorrect</span>
        <ReviseBody
          clicked={clicked}
          setClicked={setClicked}
          revisedCard={revisedCard}
        />
        <FloatingButtons>
          <div className='flex w-full flex-col items-center justify-center gap-2 py-2'>
            <Button
              label={'Next'}
              icon={<ArrowRight className='h-4 w-4' />}
              iconPosition={'right'}
              onClick={reroll}
              size={'xlg'}
              className='!w-full !max-w-xs'
              disabled={!clicked}
              alt='Next'
            />
          </div>
        </FloatingButtons>
      </Case>
    </SwitchCase>
  );
}
