'use client';

import useLongPress from '#/hooks/use-long-press.hook';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { BadgeCheck } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, useState } from 'react';
import Card from '../_ui/card/card';

interface FlashcardProps {
  flashcard: Flashcard;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onSelect?: (flashcard: Flashcard) => void;
  isInSelectionMode?: boolean;
  flipBlocked?: boolean;
}

export default function FlashcardComponent({
  isSelected,
  flashcard,
  onSelect,
  isInSelectionMode,
  flipBlocked = false,
  size = 'lg',
  ...props
}: Readonly<FlashcardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);

  const [onStart, onEnd, onMove] = useLongPress<Flashcard>(
    (flashcard) => {
      window.umami.track('Flashcard long pressed');
      if (onSelect) {
        onSelect(flashcard);
      }
    },
    () => {
      window.umami.track('Flashcard short pressed');
      if (isInSelectionMode) {
        window.umami.track('Flashcard selected');
        if (onSelect) {
          onSelect(flashcard);
        }
      } else if (!flipBlocked && flashcard.type !== 'index') {
        window.umami.track('Flashcard flipped');
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
    <m.div
      onMouseDown={(e) => onStart(e, flashcard)}
      onMouseUp={onEnd}
      onTouchStart={(e) => onStart(e, flashcard)}
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
        key={`${flashcard.frontUuid}:${isFlipped ? 'flipped' : 'unflipped'}`}
      >
        <Card
          tabIndex={0}
          className={cn([
            'z-10 cursor-pointer flex-col items-center p-4 py-0 outline-none focus-visible:ring  focus-visible:ring-green-400/50',
            isSelected ? 'ring ring-green-400/60' : '',
            size === 'sm' && 'h-56 w-44',
            size === 'md' && 'h-56 w-44',
            size === 'lg' && 'h-72 w-64',
          ])}
          {...props}
        >
          {(!isFlipped || isInSelectionMode) && (
            <span
              className={cn([
                'flex h-full w-full flex-col',
                (flashcard.type === 'index' || flashcard.type === 'question') &&
                  'items-center justify-center',
              ])}
            >
              <>
                {isSelected && (
                  <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6 fill-green-500 text-gray-50 dark:text-slate-950' />
                )}

                {flashcard.type !== 'index' && (
                  <h5
                    className={cn([
                      'z-20 flex h-20 w-full flex-col items-center justify-center hyphens-auto text-center',
                      size === 'sm' && 'text-xs',
                      size === 'md' && 'text-xs',
                      size === 'lg' && 'text-sm',
                      flashcard.type === 'question' &&
                        'h-full flex-col justify-center',
                    ])}
                  >
                    {flashcard.query}
                  </h5>
                )}

                {flashcard.type !== 'question' && (
                  <h2
                    className={cn([
                      'z-20 flex h-full w-full flex-col items-center hyphens-auto py-2 text-center text-green-400 ',
                      size === 'sm' && 'text-2xl',
                      size === 'md' && 'text-2xl',
                      size === 'lg' && 'text-3xl',
                      flashcard.type === 'index' && 'justify-center',
                      flashcard.type === 'single' && 'pt-8',
                    ])}
                  >
                    {flashcard.context}
                  </h2>
                )}
              </>
            </span>
          )}

          {isFlipped && !isInSelectionMode && (
            <div
              className={cn([
                'scrollbar-hidden relative z-20 flex h-full w-full flex-col overflow-y-auto hyphens-auto py-6 text-gray-500 dark:text-slate-400',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-xs',
                size === 'lg' && 'text-sm',
              ])}
            >
              <div className='sticky top-0 w-full'>
                <div className='relative flex w-full'>
                  <div className='absolute -top-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
                </div>
              </div>

              {flashcard.definition}

              <div className='sticky bottom-0 w-full'>
                <div className='relative flex w-full'>
                  <div className='absolute -bottom-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-b dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
                </div>
              </div>
            </div>
          )}
        </Card>
      </m.div>
    </m.div>
  );
}
