'use client';

import { useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCardTypesEnum } from '#/shared/enums/flash-card-types.enum';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import FlashCardComponent from '../flash-card/flash-card.comonent';

export default function HardestFlashcardsComponent() {
  const flashCardsArray = Object.values(
    useAppSelector(flashCardSelectors.selectFlashCards),
  );

  return (
    <div className='flex flex-col items-center justify-center gap-8'>
      <h4 className='text-green-400'>Hardest Flashcards</h4>
      <div className='grid w-full auto-rows-fr grid-cols-1 flex-col items-center justify-center gap-3 sm:grid-cols-2-auto'>
        {flashCardsArray
          .sort((head, tail) => tail.weight - head.weight)
          .slice(0, 4)
          .map((flashCard) => (
            <FlashCardComponent
              key={flashCard.uuid}
              flashCard={flashCard}
              reviseType={FlashCardTypesEnum.SHOW_ALL}
            />
          ))}
      </div>
    </div>
  );
}
