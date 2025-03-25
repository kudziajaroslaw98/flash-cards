'use client';

import '#/shared/utils/polyfills';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAppContext } from '#/providers/app-context';
import type { Flashcard } from '#/types/flash-card.type';

import { useResizeObserver } from '#/hooks/use-resize-observer';
import { useWindowResize } from '#/hooks/use-window-resize-observer';
import { cn } from '#/shared/utils/cn.util';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  const generateColumns = (columnsCount: number): Column[] => {
    if (!containerRef.current || containerRef.current === null) {
      return [];
    } else {
      const columns = new Array(columnsCount).fill(0).map((_, i) => {
        const key: string = i.toString();
        return {
          key,
          name: `Column-${i}`,
          width:
            containerRef.current!.getBoundingClientRect().width / columnsCount,
        };
      });

      setColumns(columns);
      return columns;
    }
  };

  const generateData = useCallback(
    (columns: Column[]) => {
      return new Array(filteredFlashcards.length).fill(0).map((_, rowIndex) =>
        columns.reduce<Array<Flashcard>>((acc, _curr, colIndex) => {
          acc.push(filteredFlashcards[rowIndex * columns.length + colIndex]);

          return acc;
        }, []),
      );
    },
    [filteredFlashcards, columns],
  );

  useWindowResize(
    ({ width }) => {
      let columns = [];
      let data: Flashcard[][] = [];

      if (width >= 1536) {
        columns = generateColumns(4);
      } else if (width >= 1280) {
        columns = generateColumns(3);
      } else if (width >= 600) {
        columns = generateColumns(2);
      } else {
        columns = generateColumns(1);
      }

      if (columns) {
        data = generateData(columns);
        setData(data);
      }
    },
    { debounceDelay: 200 },
  );

  useResizeObserver(
    () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      let columns = [];
      let data: Flashcard[][] = [];

      if (width >= 1536) {
        columns = generateColumns(4);
      } else if (width >= 1280) {
        columns = generateColumns(3);
      } else if (width >= 600) {
        columns = generateColumns(2);
      } else {
        columns = generateColumns(1);
      }

      if (columns) {
        data = generateData(columns);
        setData(data);
      }
    },
    containerRef.current,
    { debounceDelay: 200 },
  );

  useEffect(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    let columns = [];
    let data: Flashcard[][] = [];

    if (width >= 1536) {
      columns = generateColumns(4);
    } else if (width >= 1280) {
      columns = generateColumns(3);
    } else if (width >= 600) {
      columns = generateColumns(2);
    } else {
      columns = generateColumns(1);
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
    <div className='relative flex h-full w-full flex-col'>
      {flashcards.length === 0 && (
        <div className='flex flex-col items-center justify-center py-10'>
          <TreePalm className='mb-8 size-12 text-green-500' />
          <span>Looks like your flashcards are on vacation.</span>
          <span>Time to bring them back!</span>
        </div>
      )}
      {flashcards.length > 0 && (
        <div
          ref={containerRef}
          className={cn(['grid h-full w-full gap-4 transition-all'])}
        >
          <VirtualizedFlashcardList
            columns={columns}
            data={data}
            isInSelectionMode={isInSelectionMode}
            isSelected={isSelected}
            toggleSelected={toggleSelected}
          />
        </div>
      )}
    </div>
  );
}
