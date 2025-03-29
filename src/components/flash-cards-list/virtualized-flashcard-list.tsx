import { cn } from '#/shared/utils/cn.util';
import { Flashcard } from '#/types/flash-card.type';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { Fragment, useCallback, useRef } from 'react';
import FlashcardComponent from '../flash-card/flash-card';

interface Column {
  key: string;
  name: string;
  width: number;
}

export function VirtualizedFlashcardList({
  data,
  columns,
  isSelected,
  toggleSelected,
  isInSelectionMode,
}: {
  data: Flashcard[][];
  columns: Array<Column>;
  isSelected: (flashcard: Flashcard) => boolean;
  toggleSelected: (flashcard: Flashcard) => void;
  isInSelectionMode: boolean;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const getColumnWidth = useCallback(
    (index: number) => columns[index].width,
    [columns],
  );

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    estimateSize: () => 192,
    getScrollElement: () => parentRef.current,
    useAnimationFrameWithResizeObserver: true,
    indexAttribute: 'data-row-index',
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getColumnWidth,
    scrollMargin: 16,
    indexAttribute: 'data-column-index',
  });

  const calculateTransformX = useCallback(
    (index: number) => {
      if (index === 0) return 4;
      if (index === columns.length - 1)
        return index * getColumnWidth(index) + 4;
      return index * getColumnWidth(index) + 4;
    },
    [columns],
  );

  return (
    <div
      ref={parentRef}
      style={{
        display: 'flex',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%',
        position: 'relative',
        height: '750px',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <Fragment key={virtualRow.key}>
          {columnVirtualizer.getVirtualItems().map(
            (virtualColumn) =>
              data[virtualRow.index][virtualColumn.index] && (
                <div
                  key={`${virtualRow.key}-${virtualColumn.key}`}
                  data-column-index={virtualColumn.index}
                  data-row-index={virtualRow.index}
                >
                  <AnimatePresence mode='popLayout'>
                    <m.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${getColumnWidth(virtualColumn.index) - 16}px`,
                        height: `${virtualRow.size}px`,
                        transform: `translateX(${calculateTransformX(virtualColumn.index)}px) translateY(${virtualRow.start + 16}px)`,
                        zIndex: 20,
                      }}
                      whileHover={{ zIndex: 21 }}
                    >
                      <FlashcardComponent
                        flashcard={data[virtualRow.index][virtualColumn.index]}
                        size={'horizontal-sm'}
                        isSelected={isSelected(
                          data[virtualRow.index][virtualColumn.index],
                        )}
                        onSelect={() =>
                          toggleSelected(
                            data[virtualRow.index][virtualColumn.index],
                          )
                        }
                        isInSelectionMode={isInSelectionMode}
                      />
                    </m.div>
                  </AnimatePresence>
                  {virtualRow.index === data.length - 1 && (
                    <div
                      className={cn(['h-96 w-1 md:h-48'])}
                      style={{
                        transform: `translateX(${calculateTransformX(virtualColumn.index)}px) translateY(${virtualRow.start + 16 + 32}px)`,
                      }}
                    ></div>
                  )}
                </div>
              ),
          )}
        </Fragment>
      ))}
    </div>
  );
}
