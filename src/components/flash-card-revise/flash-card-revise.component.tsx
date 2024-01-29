'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import FlashCardComponent from '#/components/flash-card/flash-card.comonent';
import ButtonComponent from '#/components/ui/button/button.component';
import DropdownComponent from '#/components/ui/dropdown/dropdown.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import { DEFAULT_STATS } from '#/utils/defaults/stats.default';
import { FlashCardTypesEnum } from '#/utils/enums/flash-card-types.enum';
import getRandomRangedNumber from '#/utils/functions/get-random-ranged-number.util';
import { FlashCardModel } from '#/utils/models/flash-card.model';
import { FlashCards } from '#/utils/types/local-storage-flash-card.type';
import LinkComponent from '../ui/link/link.component';

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
    setToLocalStorage: setFlashCards,
  } = useLocalStorage<FlashCardModel, FlashCards>('words', {});

  const { value: statistics, setToLocalStorage: setStatistics } =
    useLocalStorage('stats', DEFAULT_STATS);

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
    const clonedStats = cloneDeep(statistics);

    clonedStats.answers += 1;

    if (correct) {
      clonedStats.correctAnswers += 1;
      if (revisedCard && revisedCard?.weight > 0.01) {
        (clonedFlashCards[flashCard.uuid].weight -= 0.01).toFixed(2);
      }
    } else {
      clonedStats.incorrectAnswers += 1;
      (clonedFlashCards[flashCard.uuid].weight += 0.01).toFixed(2);
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    setFlashCards(clonedFlashCards);
    setStatistics(clonedStats);
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

  return flashCardsArray.length > 0 ? (
    <div className='flex h-full flex-col justify-stretch pb-36'>
      <div className='flex h-full flex-col items-center gap-2 md:gap-8'>
        <div
          className={`mb-2 flex h-auto min-h-16 w-full max-w-80 flex-col items-center justify-center gap-4 px-4 text-center text-lg font-semibold md:max-w-xl dark:text-slate-200`}
        >
          {reviseType === FlashCardTypesEnum.GUESS_DEFINITION &&
            revisedCard && <p>{revisedCard.word}</p>}

          {reviseType === FlashCardTypesEnum.GUESS_NAME && revisedCard && (
            <p>{revisedCard.definition}</p>
          )}
        </div>

        <div className='grid w-full auto-rows-fr grid-cols-1 flex-col items-center justify-center gap-3 sm:grid-cols-2-auto'>
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
      </div>

      <div className='fixed bottom-0 left-0 z-40 flex h-40 w-full flex-col items-center justify-center gap-4 bg-gray-200/10 backdrop-blur-md sm:bottom-32 dark:bg-slate-950/10'>
        <ButtonComponent
          class={
            'max-w-80 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 md:h-10 md:w-52 dark:bg-green-500 dark:hover:bg-green-400'
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
  ) : (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-xl'>
      <h3 className='text-gray-600 dark:text-slate-200'>
        You dont have any flashcards yet.
      </h3>
      <LinkComponent
        href='/learn'
        label=' You can add them here'
        class='underline'
      />
    </div>
  );
}
