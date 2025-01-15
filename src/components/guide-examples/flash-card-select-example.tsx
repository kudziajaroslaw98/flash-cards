'use client';

import type { FlashCard } from '#/types/flash-card.type';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import FlashCardComponent from '../flash-card/flash-card';

export default function FlashCardSelectExample() {
  const flashcards = [
    {
      type: 'index',
      frontUuid: 'c5f20e37-c4c6-4a76-b987-4ab0adcf1ae5',
      question: "What's the meaning of word below?",
      questionAddition: 'Lazy',
      answer: 'Unwilling to work or use energy.',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        interval: 0,
        easeFactor: 1.3,
        reviews: 0,
        dueDate: new Date(Date.now() + 1000 * 60).toISOString(),
        lastReviewAt: new Date().toISOString(),
      },
      sets: [],
    },
    {
      type: 'question',
      frontUuid: '757a6f43-2dc2-4d58-ba2d-5694defa0eab',
      question: "What's the meaning of word below?",
      questionAddition: 'Quick',
      answer: 'Happening or done with great speed.',
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        interval: 0,
        easeFactor: 1.3,
        reviews: 0,
        dueDate: new Date(Date.now() + 1000 * 60).toISOString(),
        lastReviewAt: new Date().toISOString(),
      },

      sets: [],
    },
    {
      type: 'single',
      frontUuid: 'b03e05d5-c42d-4808-a621-1ac2fc4abed6',
      question: "What's the meaning of word below?",
      questionAddition: 'Happy',
      answer: 'Feeling or showing pleasure or contentment.',
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        interval: 0,
        easeFactor: 1.3,
        reviews: 0,
        dueDate: new Date(Date.now() + 1000 * 60).toISOString(),
        lastReviewAt: new Date().toISOString(),
      },
      sets: [],
    },
  ] as FlashCard[];

  const [selected, setSelected] = useState<FlashCard[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const isSelected = useCallback(
    (flashCard: FlashCard) => {
      return (
        selected.findIndex((item) => item.frontUuid === flashCard.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (flashCard: FlashCard) => {
      if (isSelected(flashCard)) {
        setSelected((prev) =>
          prev.filter((item) => flashCard.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, flashCard]);
      }
    },
    [isSelected],
  );

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap justify-center gap-4'>
        {flashcards.map((flashCard) => (
          <div key={flashCard.frontUuid}>
            <FlashCardComponent
              flashCard={flashCard}
              size={'md'}
              isSelected={isSelected(flashCard)}
              onSelect={() => toggleSelected(flashCard)}
              isInSelectionMode={isInSelectionMode}
            />
          </div>
        ))}
      </div>

      <div className='flex flex-wrap justify-center gap-4 pt-8'>
        <Button
          icon={<Plus className='h-4 w-4' />}
          size={'icon-square'}
        />

        <Button
          icon={<Pencil className='h-4 w-4' />}
          size={'icon-square'}
          disabled={selected.length === 0}
          variant={'secondary'}
        />

        <Button
          disabled={selected.length === 0}
          variant={'destructive'}
          icon={<Trash className='h-4 w-4' />}
          size={'icon-square'}
        />
      </div>

      <span className='text-center text-xs'>
        (It&apos;s only demonstration, buttons do nothing)
      </span>
    </div>
  );
}
