'use client';

import '#/shared/utils/polyfills';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useAppContext } from '#/providers/app-context';
import type { Flashcard } from '#/types/flash-card.type';

import useContainerAndWindowResizeObserver from '#/hooks/use-container-and-window-resize-observer';
import { cn } from '#/shared/utils/cn.util';
import { TreePalm } from 'lucide-react';
import { VirtualizedFlashcardList } from './virtualized-flashcard-list';

export default function FlashcardsList({
  selected,
  filteredFlashcards,
  setSelected,
}: {
  selected: Flashcard[];
  filteredFlashcards: Flashcard[];
  setSelected: Dispatch<SetStateAction<Flashcard[]>>;
}) {
  const { flashcards } = useAppContext();
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [columns, setColumns] = useState<number>(1);

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

  const containerRef = useContainerAndWindowResizeObserver(
    ({ windowWidth }) => {
      if (windowWidth >= 1536) {
        setColumns(4);
      } else if (windowWidth >= 1280) {
        setColumns(3);
      } else if (windowWidth >= 600) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    },
  );

  useEffect(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    if (width >= 1536) {
      setColumns(4);
    } else if (width >= 1280) {
      setColumns(3);
    } else if (width >= 600) {
      setColumns(2);
    } else {
      setColumns(1);
    }
  }, [filteredFlashcards]);

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full flex-col'
    >
      {flashcards.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10'>
          <TreePalm className='mb-8 size-12 text-green-500' />
          <span>Looks like your flashcards are on vacation.</span>
          <span>Time to bring them back!</span>
        </div>
      )}
      {flashcards.length > 0 && (
        <div className='h-full w-full'>
          <div className={cn(['grid h-full w-full gap-4 transition-all'])}>
            <VirtualizedFlashcardList
              data={filteredFlashcards}
              columns={columns}
              isInSelectionMode={isInSelectionMode}
              isSelected={isSelected}
              toggleSelected={toggleSelected}
            />
          </div>
        </div>
      )}
    </div>
  );
}
