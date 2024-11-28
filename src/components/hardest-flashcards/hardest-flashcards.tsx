'use client';

import FlashCardComponent from '../flash-card/flash-card';
import { useAppContext } from '#/providers/app-context';

export default function HardestFlashcardsComponent() {
  const { flashcards } = useAppContext();
  return (
    <div className='flex flex-col items-center justify-center gap-8'>
      <h4 className='text-green-400'>Hardest Flashcards</h4>
      <div className='grid w-full auto-rows-fr grid-cols-1 flex-col items-center justify-center gap-3 sm:grid-cols-2-auto'>
        {flashcards
          .sort((head, tail) => tail.weight - head.weight)
          .slice(0, 4)
          .map((flashCard) => (
            <FlashCardComponent
              key={flashCard.frontUuid}
              flashCard={flashCard}
            />
          ))}
      </div>
    </div>
  );
}
