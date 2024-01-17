'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import FlashCardComponent from '#/components/flash-card/flash-card.comonent';
import ButtonComponent from '#/components/ui/button/button.component';
import DropdownComponent from '#/components/ui/dropdown/dropdown.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import { FlashCardTypesEnum } from '#/utils/enums/flash-card-types.enum';
import getRandomRangedNumber from '#/utils/functions/get-random-ranged-number.util';
import { FlashCardModel } from '#/utils/models/flash-card.model';
import { FlashCards } from '#/utils/types/local-storage-flash-card.type';

export default function FlashCardReviseComponent() {
  const [reviseType, setReviseType] = useState(
    FlashCardTypesEnum.GUESS_DEFINITION,
  );
  const [revisedCard, setRevisedCard] = useState<FlashCardModel>();
  const [clickedCard, setClickedCard] = useState<FlashCardModel>();
  const [dropdownItems] = useState(Object.values(FlashCardTypesEnum));
  const [clicked, setClicked] = useState(false);

  const {
    arrayOfValues: flashCardsArray,
    value: flashCards,
    setToLocalStorage,
  } = useLocalStorage<FlashCardModel, FlashCards>('words', {});

  const { pickedItems: randomCards, reshuffle } =
    useRandomArrayItems<FlashCardModel>(
      flashCardsArray,
      flashCardsArray.map((item) => item.weight),
      4,
    );

  const isCorrect = (flashCard?: FlashCardModel) => {
    return isEqual(revisedCard, flashCard ?? clickedCard);
  };

  const changeClicked = (flashCard: FlashCardModel) => {
    if (clicked) {
      return;
    }

    const correct = isCorrect(flashCard);
    const clonedFlashCards = cloneDeep(flashCards);

    if (correct) {
      if (revisedCard && revisedCard?.weight > 0.01) {
        clonedFlashCards[flashCard.uuid].weight -= 0.01;
      }
    } else {
      clonedFlashCards[flashCard.uuid].weight += 0.01;
    }

    setToLocalStorage(clonedFlashCards);
    setClickedCard(flashCard);
    setClicked(true);
  };

  const reshuffleFlashCards = () => {
    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClicked(false);

    reshuffle();
  };

  const changeReviseType = (value: FlashCardTypesEnum) => {
    setReviseType(value);
  };

  useEffect(() => {
    setRevisedCard(randomCards[getRandomRangedNumber(0, 3)]);
  }, [randomCards]);

  return (
    flashCardsArray.length > 0 && (
      <div className='flex flex-col items-center justify-center gap-2 md:gap-8'>
        <div
          className={`mb-2 flex h-auto min-h-16 w-full max-w-80 flex-col items-center justify-center gap-4 px-4 text-center text-lg font-semibold md:max-w-xl dark:text-slate-200`}
        >
          {reviseType === FlashCardTypesEnum.GUESS_DEFINITION &&
            revisedCard && <p>{revisedCard.word}</p>}

          {reviseType === FlashCardTypesEnum.GUESS_NAME && revisedCard && (
            <p>{revisedCard.definition}</p>
          )}
        </div>

        <div className='grid h-full w-full grid-cols-1 items-center justify-center gap-4 sm:grid-cols-2-auto'>
          {randomCards.map((flashCard) => (
            <FlashCardComponent
              key={flashCard.uuid}
              flashCard={flashCard}
              reviseType={reviseType}
              correct={isCorrect(flashCard)}
              clickedOnFlashCard={flashCard === clickedCard}
              clickedOverall={clicked}
              onClick={(flashCard) => changeClicked(flashCard)}
            />
          ))}
        </div>

        <div className='flex w-full flex-col items-center gap-4'>
          <ButtonComponent
            class={
              'mt-8 min-w-52 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 md:h-10 dark:bg-green-500 dark:hover:bg-green-400'
            }
            onClick={reshuffleFlashCards}
          >
            <span>Reshuffle</span>
            <ArrowPathIcon className='h-4 w-4' />
          </ButtonComponent>

          <DropdownComponent
            items={dropdownItems}
            defaultValue={dropdownItems[0]}
            onChange={(value) => changeReviseType(value)}
          />
        </div>
      </div>
    )
  );
}
