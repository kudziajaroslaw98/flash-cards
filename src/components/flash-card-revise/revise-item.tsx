import { cn } from '#/shared/utils/cn.util';
import type { Flashcard } from '#/types/flash-card.type';
import { CornerLeftDown } from 'lucide-react';
import Card from '../_ui/card/card';
import FlashcardComponent from '../flash-card/flash-card';

type ReviewItem = {
  clicked: boolean;
  revisedCard: Flashcard | undefined;
};

export function ReviseItem({ clicked, revisedCard }: ReviewItem) {
  return (
    <div className='grid w-full items-center justify-center'>
      <div
        className={cn([
          'flex w-full items-center justify-end gap-2 opacity-0 transition md:translate-x-20',
          clicked && revisedCard?.type !== 'index' && 'opacity-100',
        ])}
      >
        <CornerLeftDown className='size-5 text-green-400' />

        <span className='w-32 text-xs italic text-gray-600 dark:text-slate-500'>
          Click on the card to flip it
        </span>
      </div>

      <div>
        {revisedCard ? (
          <FlashcardComponent
            key={revisedCard.frontUuid}
            flashcard={revisedCard}
            flipBlocked={!clicked}
          />
        ) : (
          <Card className='h-96 w-80' />
        )}
      </div>
    </div>
  );
}
