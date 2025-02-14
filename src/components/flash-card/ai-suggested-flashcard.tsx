import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { BadgeCheck, Check, X } from 'lucide-react';
import * as m from 'motion/react-m';
import { useState } from 'react';
import { Button } from '../_ui/button/button';
import Card from '../_ui/card/card';

export type AISuggestedFlashcardType = Pick<
  Flashcard,
  | 'type'
  | 'examples'
  | 'keyPoints'
  | 'synonyms'
  | 'relatedFacts'
  | 'tags'
  | 'context'
  | 'query'
  | 'definition'
> & { id: 'string'; topic: 'string' };

interface AISuggestedFlashcardProps {
  flashcard: AISuggestedFlashcardType;
  isSelected?: boolean;
}

export function AISuggestedFlashcard({
  isSelected,
  flashcard,
  ...props
}: Readonly<AISuggestedFlashcardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <m.div
      onClick={() => setIsFlipped(!isFlipped)}
      className='flex flex-col items-center gap-4'
    >
      <m.div
        animate={{
          translateY: '0%',
          opacity: 100,
          zIndex: 21,
        }}
        initial={{ translateY: '10%', opacity: 0, zIndex: -20 }}
        exit={{
          translateY: '-5%',
          opacity: 0,
          zIndex: -20,
        }}
        className='flex justify-center'
        key={`${flashcard.id}:${isFlipped ? 'flipped' : 'unflipped'}`}
      >
        <Card
          tabIndex={0}
          className={cn([
            'group relative z-10 cursor-pointer flex-col items-center p-4 py-0 outline-none focus-visible:ring  focus-visible:ring-green-400/50',
            isSelected ? 'ring ring-green-400/60' : '',
            'h-56 w-44',
          ])}
          {...props}
        >
          {!isFlipped && (
            <span className={cn(['flex h-full w-full flex-col'])}>
              <>
                {isSelected && (
                  <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6 fill-green-500 text-gray-50 dark:text-slate-950' />
                )}

                {flashcard.type !== 'index' && (
                  <h5
                    className={cn([
                      'z-20 flex h-20 w-full flex-col items-center justify-center hyphens-auto text-center',
                      'text-xs',
                    ])}
                  >
                    {flashcard.query}
                  </h5>
                )}

                {flashcard.type !== 'question' && (
                  <h2
                    className={cn([
                      'z-20 flex h-full w-full flex-col items-center hyphens-auto py-2 text-center text-green-400 ',
                      'text-2xl',
                      flashcard.type === 'single' && 'pt-8',
                    ])}
                  >
                    {flashcard.context}
                  </h2>
                )}
              </>
            </span>
          )}

          {isFlipped && (
            <div
              className={cn([
                'scrollbar-hidden relative z-20 flex h-full w-full flex-col overflow-y-auto hyphens-auto py-6 text-gray-500 dark:text-slate-400',
                'text-xs',
              ])}
            >
              <div className='sticky top-0 w-full'>
                <div className='relative flex w-full'>
                  <div className='absolute -top-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
                </div>
              </div>

              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1'>
                  <span className='text-gray-400'>Definition:</span>
                  <span>{flashcard?.definition}</span>
                </div>

                {flashcard?.examples && (
                  <div className='flex flex-col gap-1'>
                    <span className='text-gray-400'>Examples:</span>
                    <ul className='flex list-inside !list-disc flex-col gap-1 '>
                      {flashcard?.examples.split(';').map((example) => (
                        <li
                          className='list-item decoration-gray-600'
                          key={example.trim()}
                        >
                          {example.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {flashcard?.synonyms && (
                  <div className='flex flex-col gap-1'>
                    <span className='text-gray-400'>Synonyms:</span>
                    <ul className='flex list-inside !list-disc flex-col gap-1 '>
                      {flashcard?.synonyms.split(';').map((synonym) => (
                        <li
                          className='list-item decoration-gray-600'
                          key={synonym.trim()}
                        >
                          {synonym.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {flashcard?.keyPoints && (
                  <div className='flex flex-col gap-1'>
                    <span className='text-gray-400'>Key Points:</span>
                    <ul className='flex list-inside !list-disc flex-col gap-1 '>
                      {flashcard?.keyPoints.split(';').map((keyPoint) => (
                        <li
                          className='list-item decoration-gray-600'
                          key={keyPoint.trim()}
                        >
                          {keyPoint.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {flashcard?.relatedFacts && (
                  <div className='flex flex-col gap-1'>
                    <span className='text-gray-400'>Related Facts:</span>
                    <ul className='flex list-inside !list-disc flex-col gap-1 '>
                      {flashcard?.relatedFacts.split(';').map((fact) => (
                        <li
                          className='list-item decoration-gray-600'
                          key={fact.trim()}
                        >
                          {fact.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className='sticky bottom-0 w-full'>
                <div className='relative flex w-full'>
                  <div className='absolute -bottom-7 left-0 z-[22] flex h-8 w-full bg-transparent bg-[radial-gradient(transparent_1px,rgba(249_250_251)_1px)] from-transparent via-black via-50% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-b dark:bg-[radial-gradient(transparent_1px,rgba(2_6_23)_1px)]' />
                </div>
              </div>
            </div>
          )}

          <div className='absolute bottom-0 right-[50%] z-50 hidden translate-x-1/2 translate-y-4 gap-4 opacity-0 transition group-hover:-translate-y-4 group-hover:opacity-100 group-focus:-translate-y-4 group-focus:opacity-100 md:flex'>
            <Button
              icon={<Check className='size-4' />}
              size={'icon-sm'}
              alt='accept suggestion'
              onClick={() => setIsFlipped(false)}
            />

            <Button
              icon={<X className='size-4' />}
              size={'icon-sm'}
              alt='reject suggestion'
              onClick={() => setIsFlipped(false)}
              variant={'destructive'}
            />
          </div>
        </Card>
      </m.div>
      <div className='flex gap-4 md:hidden'>
        <Button
          icon={<Check className='size-4' />}
          size={'icon-sm'}
          alt='accept suggestion'
          onClick={() => setIsFlipped(false)}
        />

        <Button
          icon={<X className='size-4' />}
          size={'icon-sm'}
          alt='reject suggestion'
          onClick={() => setIsFlipped(false)}
          variant={'destructive'}
        />
      </div>
    </m.div>
  );
}
