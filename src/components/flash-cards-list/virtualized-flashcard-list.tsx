import { Flashcard } from '#/types/flash-card.type';
import { useVirtualizer } from '@tanstack/react-virtual';
import * as m from 'motion/react-m';
import { useEffect, useRef } from 'react';
import FlashcardComponent from '../flash-card/flash-card';

export function VirtualizedFlashcardList({
  data,
  columns,
  isSelected,
  toggleSelected,
  isInSelectionMode,
}: {
  data: Flashcard[];
  columns: number;
  isSelected: (flashcard: Flashcard) => boolean;
  toggleSelected: (flashcard: Flashcard) => void;
  isInSelectionMode: boolean;
}) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const columnVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 192,
    overscan: 5,
    lanes: columns,
    indexAttribute: 'data-column-index',
    useAnimationFrameWithResizeObserver: true,
    scrollPaddingEnd: 192,
  });

  useEffect(() => {
    columnVirtualizer.measure();
  }, [columns]);

  return (
    <div
      className='relative flex h-[600px] w-full overflow-y-auto overflow-x-hidden md:h-[825px]'
      ref={parentRef}
    >
      <div
        className='w-full p-2'
        style={{ height: columnVirtualizer.getTotalSize() }}
      >
        <div className='relative'>
          {columnVirtualizer.getVirtualItems().map(
            (virtualColumn) =>
              data[virtualColumn.index] && (
                <m.div
                  key={`${virtualColumn.key}`}
                  data-column-index={virtualColumn.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${virtualColumn.lane * (100 / columns)}%`,
                    width: `calc(${100 / columns}% - 16px)`,
                    height: `176px`,
                    transform: `translateY(${virtualColumn.start + 8}px)`,
                    zIndex: 20,
                  }}
                  whileHover={{ zIndex: 21 }}
                >
                  <FlashcardComponent
                    flashcard={data[virtualColumn.index]}
                    size={'horizontal-sm'}
                    isSelected={isSelected(data[virtualColumn.index])}
                    onSelect={() => toggleSelected(data[virtualColumn.index])}
                    isInSelectionMode={isInSelectionMode}
                  />
                </m.div>
              ),
          )}
        </div>
      </div>
    </div>
  );
}
