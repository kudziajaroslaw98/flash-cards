import { db } from '#/db/dexie.db';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import { Flashcard } from '#/types/flash-card.type';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ReviseBody } from './revise-body';

export const ReviseAllStage = () => {
  const {
    setReviseStage: setStage,
    clicked,
    setClicked,
    currentDay,
    currentSession,
    reviewFlashcards,
    newFlashcards,
  } = useRevisePlanContext();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [revisedCard, setRevisedCard] = useState<Flashcard>();

  const [reviewIncorrect, setReviewIncorrect] = useState<string[]>([]);
  const [newIncorrect, setNewIncorrect] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);

  const reroll = () => {
    if (!clicked || !revisedCard) return;

    const leftCards = flashcards.filter((card) =>
      completedCards?.every((c) => c !== card.frontUuid),
    );

    if (leftCards.length === 0) {
      setStage((prev) => prev + 1);
      db.studyDays.update(currentDay!.frontUuid, {
        incorrectCards: [],
      });
    }

    setCompletedCards([...completedCards, revisedCard.frontUuid]);
    setRevisedCard(leftCards[0]);
    setClicked(false);
  };

  useEffect(() => {
    if (revisedCard || flashcards.length === 0) {
      return;
    }
    const leftCards = flashcards.filter((card) =>
      completedCards?.every((c) => c !== card.frontUuid),
    );
    setRevisedCard(leftCards[0]);
    setClicked(false);
  }, [revisedCard, currentDay, completedCards, flashcards]);

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
    if (revisedCard || !currentSession || !currentDay) {
      return;
    }

    const allFlashcards = [...reviewFlashcards, ...newFlashcards];
    const allIncorrect = [...reviewIncorrect, ...newIncorrect];

    setFlashcards(
      allFlashcards.filter((card) => allIncorrect.includes(card.frontUuid)),
    );
    setCompletedCards(
      currentSession.completedCards.filter(
        (card) => !allIncorrect.includes(card),
      ),
    );
  }, [reviewFlashcards, newFlashcards, currentSession]);

  return (
    <>
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
    </>
  );
};
