import useLongPress from '#/hooks/use-long-press.hook';
import type { FlashCard } from '#/shared/models/flash-card.model';
import { cn } from '#/shared/utils/cn.util';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';
import Card from '../_ui/card/card';

interface FlashCardProps {
  flashCard: FlashCard;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onSelect?: (flashCard: FlashCard) => void;
  isInSelectionMode?: boolean;
  flipBlocked?: boolean;
}

export default function FlashCardComponent({
  isSelected,
  flashCard,
  onSelect,
  isInSelectionMode,
  flipBlocked = false,
  size = 'lg',
  ...props
}: Readonly<FlashCardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);

  const [onStart, onEnd, onMove] = useLongPress<FlashCard>(
    (flashcard) => {
      window.umami.track('Flash card long pressed');
      if (onSelect) {
        onSelect && onSelect(flashcard);
      }
    },
    () => {
      window.umami.track('Flash card short pressed');
      if (isInSelectionMode) {
        window.umami.track('Flash card selected');
        onSelect && onSelect(flashCard);
      } else if (!flipBlocked) {
        window.umami.track('Flash card flipped');
        setIsFlipped(!isFlipped);
      }
    },
  );

  useEffect(() => {
    if (isInSelectionMode) {
      setIsFlipped(false);
    }
  }, [isInSelectionMode]);

  return (
    <div
      onMouseDown={(e) => onStart(e, flashCard)}
      onMouseUp={onEnd}
      onTouchStart={(e) => onStart(e, flashCard)}
      onTouchEnd={onEnd}
      onTouchMove={onMove}
    >
      <m.div
        animate={{ translateY: '0%', opacity: 100, zIndex: 21 }}
        initial={{ translateY: '10%', opacity: 0, zIndex: -20 }}
        exit={{
          translateY: '-5%',
          opacity: 0,
          zIndex: -20,
        }}
        className='flex justify-center'
        key={`${flashCard.frontUuid}:${isFlipped ? 'flipped' : 'unflipped'}`}
      >
        <Card
          // onKeyDown={handleKeyDown}
          tabIndex={0}
          className={cn([
            'z-10 flex-col items-center p-4',
            isSelected ? 'ring ring-green-400/60' : '',
            size === 'sm' && 'h-56 w-44',
            size === 'md' && 'h-72 w-64',
            size === 'lg' && 'h-96 w-80',
          ])}
          {...props}
        >
          {(!isFlipped || isInSelectionMode) && (
            <>
              {isSelected && (
                <CheckBadgeIcon className='absolute -right-4 -top-4 h-6 w-6 text-green-400' />
              )}

              <h5
                className={cn([
                  'z-20 flex h-20 w-full items-center justify-center rounded-md text-center',
                  size === 'sm' && 'text-xs',
                  size === 'md' && 'text-sm',
                  size === 'lg' && 'text-sm',
                ])}
              >
                Q: {flashCard.question}
              </h5>

              <h2
                className={cn([
                  'z-20 flex h-full w-full justify-center rounded-md pt-16 text-center text-green-400 ',
                  size === 'sm' && 'pt-6 text-2xl',
                  size === 'md' && 'pt-10 text-3xl',
                  size === 'lg' && 'pt-16 text-4xl',
                ])}
              >
                {flashCard.questionAddition}
              </h2>
            </>
          )}

          {isFlipped && !isInSelectionMode && (
            <p
              className={cn([
                'z-20 flex h-full w-full items-center justify-center rounded-md px-4 text-center text-gray-500 dark:text-slate-400',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
              ])}
            >
              {flashCard.answer}
            </p>
          )}
        </Card>
      </m.div>
    </div>
  );
}
