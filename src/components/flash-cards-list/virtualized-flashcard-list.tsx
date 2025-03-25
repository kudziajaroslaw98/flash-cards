import { Flashcard } from '#/types/flash-card.type';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import * as m from 'motion/react-m';
import { useRef } from 'react';
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
  const getColumnWidth = (index: number) => columns[index].width;

  const rowVirtualizer = useWindowVirtualizer({
    count: data.length,
    estimateSize: () => 192,
    overscan: 2,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getColumnWidth,
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      style={{
        display: 'flex',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingLeft: '-16px',
        paddingRight: '-16px',
        marginLeft: '16px',
        marginRight: '16px',
        width: '100%',
        position: 'relative',
        height: '750px',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={`virtual-list-row-${virtualRow.key}`}>
          {columnVirtualizer.getVirtualItems().map(
            (virtualColumn) =>
              data[virtualRow.index][virtualColumn.index] && (
                <m.div
                  key={virtualColumn.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${getColumnWidth(virtualColumn.index) - 16}px`,
                    height: `${virtualRow.size}px`,
                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
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
              ),
          )}
        </div>
      ))}
    </div>
  );
}
