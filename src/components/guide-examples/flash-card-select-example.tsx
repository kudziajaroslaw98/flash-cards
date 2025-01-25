'use client';

import type { Flashcard } from '#/types/flash-card.type';
import { Pencil, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import FlashcardComponent from '../flash-card/flash-card';

export default function FlashcardSelectExample() {
  const flashcards = [
    {
      type: 'index',
      frontUuid: 'c5f20e37-c4c6-4a76-b987-4ab0adcf1ae5',
      query: "What's the meaning of word below?",
      context: 'Lazy',
      definition: 'Unwilling to work or use energy.',
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
      query: "What's the meaning of word below?",
      context: 'Quick',
      definition: 'Happening or done with great speed.',
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
      query: "What's the meaning of word below?",
      context: 'Happy',
      definition: 'Feeling or showing pleasure or contentment.',
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
  ] as Flashcard[];

  const [selected, setSelected] = useState<Flashcard[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const isSelected = useCallback(
    (flashcard: Flashcard) => {
      return (
        selected.findIndex((item) => item.frontUuid === flashcard.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (flashcard: Flashcard) => {
      if (isSelected(flashcard)) {
        setSelected((prev) =>
          prev.filter((item) => flashcard.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, flashcard]);
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
        {flashcards.map((flashcard) => (
          <div key={flashcard.frontUuid}>
            <FlashcardComponent
              flashcard={flashcard}
              size={'md'}
              isSelected={isSelected(flashcard)}
              onSelect={() => toggleSelected(flashcard)}
              isInSelectionMode={isInSelectionMode}
            />
          </div>
        ))}
      </div>

      <div className='flex flex-wrap justify-center gap-4 pt-8'>
        <Button
          icon={<Plus className='h-4 w-4' />}
          size={'icon-square'}
          alt='Add Flashcard'
        />

        <Button
          icon={<Pencil className='h-4 w-4' />}
          size={'icon-square'}
          disabled={selected.length === 0}
          variant={'secondary'}
          alt='Edit Flashcard'
        />

        <Button
          disabled={selected.length === 0}
          variant={'destructive'}
          icon={<Trash className='h-4 w-4' />}
          size={'icon-square'}
          alt='Delete Flashcard'
        />
      </div>

      <span className='text-center text-xs'>
        (It&apos;s only demonstration, buttons do nothing)
      </span>
    </div>
  );
}
