import { db } from '#/db/dexie.db';
import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import type { Flashcard } from '#/types/flash-card.type';
import { useEffect, useMemo, useState } from 'react';
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
  const [revisedCard, setRevisedCard] = useState<Flashcard | undefined>(
    undefined,
  );
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  // Memoize incorrect card UUIDs derived from the currentDay
  const incorrectCardUuids = useMemo(() => {
    if (!currentDay) return new Set<string>();
    return new Set(currentDay.incorrectCards);
  }, [currentDay]);

  // Memoize the list of all flashcards relevant to the current day
  const allDayFlashcards = useMemo(
    () => [...reviewFlashcards, ...newFlashcards],
    [reviewFlashcards, newFlashcards],
  );

  // Filter the flashcards for this stage (incorrect ones)
  useEffect(() => {
    if (!currentDay) {
      setFlashcards([]);
      return;
    }
    const incorrectFlashcardsForStage = allDayFlashcards.filter((card) =>
      incorrectCardUuids.has(card.frontUuid),
    );
    setFlashcards(incorrectFlashcardsForStage);
  }, [allDayFlashcards, incorrectCardUuids, currentDay]);

  // Initialize completed cards based on session, excluding incorrect ones
  useEffect(() => {
    if (!currentSession || !currentDay) {
      setCompletedCards(new Set());
      return;
    }
    const initialCompleted = new Set(
      currentSession.completedCards.filter(
        (cardUuid) => !incorrectCardUuids.has(cardUuid),
      ),
    );
    setCompletedCards(initialCompleted);
  }, [currentSession, currentDay, incorrectCardUuids]);

  // Set the next card to revise when the current one is completed or state changes
  useEffect(() => {
    if (!clicked && flashcards.length > 0) {
      const nextCard = flashcards.find(
        (card) => !completedCards.has(card.frontUuid),
      );
      setRevisedCard(nextCard); // Set to undefined if no card is found
    }
  }, [clicked, flashcards, completedCards]); // Depend on clicked state changing back to false

  const handleNextCard = () => {
    if (!clicked || !revisedCard) return;

    // Add the just-revised card to completed
    const updatedCompletedCards = new Set(completedCards).add(
      revisedCard.frontUuid,
    );
    setCompletedCards(updatedCompletedCards);

    // Find the next card that hasn't been completed
    const nextCard = flashcards.find(
      (card) => !updatedCompletedCards.has(card.frontUuid),
    );

    if (!nextCard) {
      // All incorrect cards have been reviewed in this stage
      if (currentDay) {
        db.studyDays.update(currentDay.frontUuid, {
          incorrectCards: [], // Clear incorrect cards as they've been re-reviewed
        });
      }
      setStage((prev) => prev + 1); // Move to the next overall stage
      setClicked(false); // Reset click state for the next stage
    } else {
      // Set the next card and reset the click state
      setRevisedCard(nextCard);
      setClicked(false);
    }
  };

  return (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-12'>
        <span>Revise All Incorrect</span>

        <ReviseBody
          clicked={clicked}
          setClicked={setClicked}
          revisedCard={revisedCard}
          handleReshuffle={handleNextCard}
        />
      </div>
    </div>
  );
};
