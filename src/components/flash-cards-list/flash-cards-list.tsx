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
import { splitArrayIntoChunks } from '#/shared/utils/split-array-into-chunks';
import { TreePalm } from 'lucide-react';
import { VirtualizedFlashcardList } from './virtualized-flashcard-list';

interface Column {
  key: string;
  name: string;
  width: number;
}

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
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<Flashcard[][]>([]);

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
    ({ windowWidth, containerWidth }) => {
      let columns = [];
      let data: Flashcard[][] = [];

      if (windowWidth >= 1536) {
        columns = generateColumns(4, containerWidth);
      } else if (windowWidth >= 1280) {
        columns = generateColumns(3, containerWidth);
      } else if (windowWidth >= 600) {
        columns = generateColumns(2, containerWidth);
      } else {
        columns = generateColumns(1, containerWidth);
      }

      if (columns) {
        data = generateData(columns);
        setData(data);
      }
    },
  );

  const generateColumns = (
    columnsCount: number,
    containerWidth: number | null,
  ): Column[] => {
    if (containerWidth === null) {
      return [];
    } else {
      const columns = new Array(columnsCount).fill(0).map((_, i) => {
        const key: string = i.toString();
        return {
          key,
          name: `Column-${i}`,
          width: containerWidth / columnsCount,
        };
      });

      setColumns(columns);
      return columns;
    }
  };

  const generateData = useCallback(
    (columns: Column[]) =>
      splitArrayIntoChunks<Flashcard>(
        filteredFlashcards.slice(),
        columns.length,
      ),
    [filteredFlashcards, columns],
  );

  useEffect(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const containerWidth =
      containerRef.current?.getBoundingClientRect().width ?? null;
    let columns = [];
    let data: Flashcard[][] = [];

    if (width >= 1536) {
      columns = generateColumns(4, containerWidth);
    } else if (width >= 1280) {
      columns = generateColumns(3, containerWidth);
    } else if (width >= 600) {
      columns = generateColumns(2, containerWidth);
    } else {
      columns = generateColumns(1, containerWidth);
    }

    if (columns) {
      data = generateData(columns);
      setData(data);
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
              columns={columns}
              data={data}
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
