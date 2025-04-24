import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import type { Flashcard } from '#/types/flash-card.type';
import { useEffect, useMemo, useState } from 'react';
import { ReviseBody } from './revise-body';

export const ReviseNewStage = () => {
  const {
    setReviseStage: setStage,
    completedFlashcards: completedInSession, // Renamed for clarity
    clicked,
    setClicked,
    currentDay,
    newFlashcards, // Get only the new cards for this day
  } = useRevisePlanContext();

  // State specific to this stage
  const [revisedCard, setRevisedCard] = useState<Flashcard | undefined>(
    undefined,
  );
  const [completedCardsInStage, setCompletedCardsInStage] = useState<
    Set<string>
  >(new Set());

  // Memoize the list of new flashcards for this stage
  const flashcardsForStage = useMemo(() => newFlashcards, [newFlashcards]);

  // Determine initially completed cards for *this specific stage*
  useEffect(() => {
    if (!currentDay || !completedInSession) {
      setCompletedCardsInStage(new Set());
      return;
    }
    // Filter session's completed cards to only include those relevant to *this stage* (new cards)
    const initialCompleted = new Set(
      completedInSession
        .map((fc) => fc.frontUuid) // Get UUIDs from the session completion list
        .filter((uuid) =>
          flashcardsForStage.some((newCard) => newCard.frontUuid === uuid),
        ),
    );
    setCompletedCardsInStage(initialCompleted);
  }, [completedInSession, currentDay, flashcardsForStage]);

  // Set the next card to revise when the current one is completed or state changes
  useEffect(() => {
    // Only find the next card if we are not in the 'clicked' (waiting for next) state
    // and if there are cards defined for this stage
    if (!clicked && flashcardsForStage.length > 0) {
      const nextCard = flashcardsForStage.find(
        (card) => !completedCardsInStage.has(card.frontUuid),
      );
      setRevisedCard(nextCard); // Will be undefined if no cards are left
    }
  }, [clicked, flashcardsForStage, completedCardsInStage]);

  // Handler for moving to the next card or stage
  const handleNextCard = () => {
    if (!clicked || !revisedCard) return; // Cannot proceed if not confirmed or no card

    // Add the just-revised card to this stage's completed set
    const updatedCompletedCards = new Set(completedCardsInStage).add(
      revisedCard.frontUuid,
    );
    setCompletedCardsInStage(updatedCompletedCards);

    // Find the next card in *this stage's* list that hasn't been completed yet
    const nextCard = flashcardsForStage.find(
      (card) => !updatedCompletedCards.has(card.frontUuid),
    );

    if (!nextCard) {
      // All cards for *this stage* are done
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
        <span>New Cards</span>
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
