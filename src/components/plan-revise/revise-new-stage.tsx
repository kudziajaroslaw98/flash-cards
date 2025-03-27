import { useRevisePlanContext } from '#/providers/revise-plan-provider';
import type { Flashcard } from '#/types/flash-card.type';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ReviseBody } from './revise-body';

export const ReviseNewStage = () => {
  const {
    setReviseStage: setStage,
    completedFlashcards: completed,
    clicked,
    setClicked,
    currentDay,
    currentSession,
    newFlashcards,
  } = useRevisePlanContext();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [revisedCard, setRevisedCard] = useState<Flashcard>();

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
    if (revisedCard || !currentSession || !currentDay) {
      return;
    }

    setFlashcards(newFlashcards);
  }, [newFlashcards]);

  return (
    <>
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
    </>
  );
};
