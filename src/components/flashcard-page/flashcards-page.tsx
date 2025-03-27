'use client';

import { useAppContext } from '#/providers/app-context';
import type { Flashcard } from '#/types/flash-card.type';
import { useState } from 'react';
import FlashcardsList from '../flash-cards-list/flash-cards-list';
import FlashcardsActions from './flashcards-actions';
import FlashcardsFilters from './flashcards-filters';

export default function FlashcardPage() {
  const [selected, setSelected] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const { flashcards } = useAppContext();

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='w-52 text-green-400'>Your Flashcards</h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{flashcards.length} flashcards created</span>
          </span>
        </div>

        <FlashcardsFilters
          setFilteredFlashcards={setFilteredFlashcards}
          setSelected={setSelected}
        />
      </div>

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
