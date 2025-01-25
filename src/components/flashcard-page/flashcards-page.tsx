'use client';

import type { Flashcard } from '#/types/flash-card.type';
import { useState } from 'react';
import FlashcardsCounter from '../flash-cards-counter/flash-cards-counter';
import FlashcardsList from '../flash-cards-list/flash-cards-list';
import FlashcardsActions from './flashcards-actions';
import FlashcardsFilters from './flashcards-filters';

export default function FlashcardPage() {
  const [selected, setSelected] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashcardsCounter />

      <FlashcardsFilters setFilteredFlashcards={setFilteredFlashcards} />

      <FlashcardsList
        filteredFlashcards={filteredFlashcards}
        selected={selected}
        setSelected={setSelected}
      />

      <FlashcardsActions
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
