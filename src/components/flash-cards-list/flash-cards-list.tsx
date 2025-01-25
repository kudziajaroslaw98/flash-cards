'use client';

import '#/shared/utils/polyfills';
import { useCallback, useEffect, useState } from 'react';

import FlashcardComponent from '#/components/flash-card/flash-card';

import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';

export default function FlashcardsList({
  selected,
  filteredFlashcards,
  setSelected,
}: {
  selected: Flashcard[];
  filteredFlashcards: Flashcard[];
  setSelected: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}) {
  const { flashcards } = useAppContext();

  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [tileSize] = useState<'sm' | 'md' | 'lg'>('sm');

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
    <div className='relative flex h-full w-full flex-col'>
      {flashcards.length > 0 && (
        <div
          className={cn([
            'grid h-auto w-full justify-center gap-4 transition-all',
            filteredFlashcards.length > 5
              ? 'xl:justify-between'
              : 'xl:justify-start',
            tileSize === 'sm' && 'grid-cols-[repeat(auto-fit,11rem)]',
            tileSize === 'md' && 'grid-cols-[repeat(auto-fit,11rem)]',
            tileSize === 'lg' && 'grid-cols-[repeat(auto-fit,16rem)]',
          ])}
        >
          <AnimatePresence mode='popLayout'>
            {filteredFlashcards.map((flashcard) => (
              <m.div
                key={flashcard.frontUuid}
                exit={{
                  maxHeight: 0,
                  height: 0,
                }}
                layout
              >
                <FlashcardComponent
                  flashcard={flashcard}
                  size={tileSize}
                  isSelected={isSelected(flashcard)}
                  onSelect={() => toggleSelected(flashcard)}
                  isInSelectionMode={isInSelectionMode}
                />
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
