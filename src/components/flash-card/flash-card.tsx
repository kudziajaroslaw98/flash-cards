'use client';

import useLongPress from '#/hooks/use-long-press.hook';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { BadgeCheck, Dot } from 'lucide-react';
import type { Variant } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import Card from '../_ui/card/card';

interface FlashcardProps {
  flashcard: Flashcard;
  size?: 'sm' | 'md' | 'lg' | 'horizontal-sm';
  isSelected?: boolean;
  onSelect?: (flashcard: Flashcard) => void;
  isInSelectionMode?: boolean;
  flipBlocked?: boolean;
  reviseView?: boolean;
  className?: string;
}

export default function FlashcardComponent({
  isSelected,
  flashcard,
  onSelect,
  className,
  isInSelectionMode,
  flipBlocked = false,
  size = 'md',
  reviseView = false,
  ...props
}: Readonly<FlashcardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);

  const [onStart, onEnd, onMove] = useLongPress<Flashcard>(
    (flashcard) => {
      window?.umami?.track('Flashcard long pressed');
      if (onSelect) {
        onSelect(flashcard);
      }
    },
    () => {
      window?.umami?.track('Flashcard short pressed');
      if (isInSelectionMode) {
        window?.umami?.track('Flashcard selected');
        if (onSelect) {
          onSelect(flashcard);
        }
      } else if (!flipBlocked && flashcard.type !== 'index') {
        window?.umami?.track('Flashcard flipped');
        setIsFlipped(!isFlipped);
      }
    },
  );

  useEffect(() => {
    if (isInSelectionMode) {
      setIsFlipped(false);
    }
  }, [isInSelectionMode]);

  const cardVariants: Record<string, Variant> = {
    hovered: {
      top: 0,
      left: 0,
      position: reviseView ? 'relative' : 'absolute',
      zIndex: 40,
      height: '22.75rem',
      width: '100%',
    },
    unhovered: {
      translateY: '0%',
      opacity: 100,
      height: '11rem',
      width: '100%',
      transitionEnd: {
        position: 'relative',
        zIndex: 21,
      },
    },
    initial: {
      width: '100%',
      translateY: '10%',
      opacity: 0,
      zIndex: -20,
      transitionEnd: {
        position: 'relative',
        zIndex: 20,
      },
    },
    exit: {
      translateY: '-5%',
      opacity: 0,
      zIndex: -20,
      maxHeight: 0,
      height: 0,
    },
  };

  const FlashcardSection = ({
    title,
    data,
  }: {
    title: string;
    data: string;
  }) => {
    const chunks = data.split(';');
    return (
      <div className={cn(['flex flex-col gap-1'])}>
        <span className='font-fredoka text-xs font-semibold text-gray-600 dark:text-slate-200'>
          {title}
        </span>
        {chunks.length <= 1 ? (
          <Markdown>{chunks[0].trim()}</Markdown>
        ) : (
          <ul>
            {chunks.map((chunk) => (
              <li
                className='flex'
                key={chunk.trim()}
              >
                <Dot className='size-5 min-w-5 text-green-400' />
                <Markdown>{chunk.trim()}</Markdown>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const FrontSide = () => (
    <span className={cn(['flex h-full w-full flex-col'])}>
      <>
        {isSelected && (
          <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6 fill-green-500 text-gray-50 dark:text-slate-950' />
        )}

        {flashcard.type === 'index' && (
          <>
            <h5
              className={cn([
                'z-20 flex h-full w-full flex-col items-center justify-center hyphens-auto text-center text-green-400',
                size === 'sm' && 'text-lg leading-[120%]',
                size === 'horizontal-sm' && 'text-sm leading-[120%]',
                size === 'md' && 'text-2xl',
                size === 'lg' && 'text-3xl',
              ])}
            >
              {flashcard.context}
            </h5>
          </>
        )}

        {flashcard.type === 'question' && (
          <>
            <h5
              className={cn([
                'z-20 flex h-full w-full flex-col items-center justify-center text-center',
                size === 'sm' && 'text-[0.6875rem] leading-[120%]',
                size === 'horizontal-sm' && 'text-[0.6875rem] leading-[120%]',
                size === 'md' && 'text-xs',
                size === 'lg' && 'text-sm',
              ])}
            >
              {flashcard.query}
            </h5>
          </>
        )}

        {flashcard.type === 'single' && (
          <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
            {flashcard.query && (
              <h5
                className={cn([
                  'z-20 flex h-auto w-full flex-col items-center hyphens-auto text-center font-fredoka font-semibold text-green-400',
                  size === 'sm' && 'text-lg leading-[120%]',
                  size === 'horizontal-sm' && 'text-lg leading-[100%]',
                  size === 'md' && 'text-2xl',
                  size === 'lg' && 'text-3xl',
                ])}
              >
                {flashcard.context}
              </h5>
            )}

            {flashcard.query && (
              <h5
                className={cn([
                  'z-20 flex h-auto w-full flex-col items-center justify-center text-center',
                  size === 'sm' && 'text-[0.6875rem] leading-[120%]',
                  size === 'horizontal-sm' && 'text-[0.6875rem] leading-[120%]',
                  size === 'md' && 'text-xs',
                  size === 'lg' && 'text-sm',
                ])}
              >
                {flashcard.query}
              </h5>
            )}
          </div>
        )}
      </>
    </span>
  );

  const BackSide = () => (
    <div
      className={cn([
        'scrollbar-hidden relative z-20 flex h-full w-full snap-y snap-mandatory scroll-pt-8 flex-col overflow-y-auto scroll-smooth hyphens-auto py-6 text-gray-300 text-gray-500 dark:text-slate-400',
        size === 'sm' && 'text-[.7rem]',
        size === 'horizontal-sm' && 'text-[.7rem]',
        size === 'md' && 'text-xs',
        size === 'lg' && 'text-sm',
      ])}
    >
      <div className='sticky top-0 w-full'>
        <div className='relative flex w-full'>
          <div className='absolute -top-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        {flashcard?.query && (
          <FlashcardSection
            title='Question:'
            data={flashcard?.query}
          />
        )}

        {flashcard?.definition && (
          <FlashcardSection
            title='Definition:'
            data={flashcard?.definition}
          />
        )}

        {flashcard?.answer1 && (
          <FlashcardSection
            title='Answer:'
            data={flashcard?.answer1}
          />
        )}

        {flashcard?.examples && (
          <FlashcardSection
            title='Examples:'
            data={flashcard.examples}
          />
        )}

        {flashcard?.synonyms && (
          <FlashcardSection
            title='Synonyms:'
            data={flashcard.synonyms}
          />
        )}

        {flashcard?.keyPoints && (
          <FlashcardSection
            title='Key Points:'
            data={flashcard.keyPoints}
          />
        )}

        {flashcard?.relatedFacts && (
          <FlashcardSection
            title='Related Facts:'
            data={flashcard.relatedFacts}
          />
        )}
      </div>

      <div className='sticky bottom-0 w-full'>
        <div className='relative flex w-full'>
          <div className='absolute -bottom-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-b dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
        </div>
      </div>
    </div>
  );

  return (
    <m.div
      onMouseDown={(e) => onStart(e, flashcard)}
      onMouseUp={onEnd}
      onTouchStart={(e) => onStart(e, flashcard)}
      onTouchEnd={onEnd}
      onTouchMove={onMove}
      className={cn(['relative flex h-44 w-full', className])}
    >
      <m.div
        variants={cardVariants}
        animate={'unhovered'}
        initial={'initial'}
        exit={'exit'}
        whileHover={isFlipped ? 'hovered' : ''}
        key={`${flashcard.frontUuid}:${isFlipped ? 'flipped' : 'unflipped'}`}
      >
        <Card
          tabIndex={0}
          className={cn([
            'z-10 h-full cursor-pointer flex-col items-center p-4 outline-none focus-visible:ring  focus-visible:ring-green-400/50',
            isSelected ? 'ring ring-green-400/60' : '',
          ])}
          {...props}
        >
          {(!isFlipped || isInSelectionMode) && <FrontSide />}
          {isFlipped && !isInSelectionMode && <BackSide />}
        </Card>
      </m.div>
    </m.div>
  );
}
