'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import FlashCardComponent from '#/components/flash-card/flash-card.comonent';
import ButtonComponent from '#/components/ui/button/button.component';
import DropdownComponent from '#/components/ui/dropdown/dropdown.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import { FlashCardTypesEnum } from '#/shared/enums/flash-card-types.enum';
import { FlashCardModel } from '#/shared/models/flash-card.model';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import { updateFlashCard } from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import LinkComponent from '../ui/link/link.component';

export default function FlashCardReviseComponent() {
  const [reviseType, setReviseType] = useState(
    FlashCardTypesEnum.GUESS_DEFINITION,
  );
  const [revisedCard, setRevisedCard] = useState<FlashCardModel>();
  const [clickedCard, setClickedCard] = useState<FlashCardModel>();
  const [dropdownItems] = useState(Object.values(FlashCardTypesEnum));
  const [clicked, setClicked] = useState(false);

  const flashCardsArray = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  );
  const statistics = useAppSelector(statsSelectors.selectStats);

  const dispatch = useAppDispatch();

  const { pickedItems: randomCards, reshuffle } =
    useRandomArrayItems<FlashCardModel>(
      flashCardsArray,
      flashCardsArray.map((item) => item.weight),
      4,
    );

  const isCorrect = (flashCard?: FlashCardModel) => {
    const comparisonItem = flashCard ?? clickedCard;

    return revisedCard === comparisonItem;
  };

  const changeClicked = (flashCard: FlashCardModel) => {
    if (clicked) {
      return;
    }

    const correct = isCorrect(flashCard);
    const clonedStats = { ...statistics };

    clonedStats.answers += 1;

    if (correct) {
      clonedStats.correctAnswers += 1;
      if (revisedCard && revisedCard?.weight > 0.01) {
        dispatch(
          updateFlashCard({
            flashCard: flashCard,
            updatedValue: +(flashCard.weight - 0.01).toFixed(2),
            property: 'weight',
          }),
        );
      }
    } else {
      clonedStats.incorrectAnswers += 1;

      dispatch(
        updateFlashCard({
          flashCard: flashCard,
          updatedValue: +(flashCard.weight + 0.01).toFixed(2),
          property: 'weight',
        }),
      );
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    dispatch(updateStatistics({ updatedValue: clonedStats }));
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
    const isFullRevise = randomCards.length === 4;
    const randomMax = isFullRevise ? 3 : randomCards.length - 1;

    setRevisedCard(randomCards[getRandomRangedNumber(0, randomMax)]);
  }, [randomCards]);

  return flashCardsArray.length > 0 ? (
    <div className='flex h-full flex-col justify-stretch pb-36'>
      <div className='flex h-full flex-col items-center gap-2 md:gap-8'>
        <div
          className={`text-default mb-2 flex h-auto min-h-16 w-full max-w-80 flex-col items-center justify-center gap-4 px-4 text-center md:max-w-xl`}
        >
          {reviseType === FlashCardTypesEnum.GUESS_DEFINITION &&
            revisedCard && <h5 className='text-default'>{revisedCard.word}</h5>}

          {reviseType === FlashCardTypesEnum.GUESS_NAME && revisedCard && (
            <h5 className='text-default'>{revisedCard.definition}</h5>
          )}
        </div>

        <div className='grid w-full auto-rows-fr grid-cols-1 flex-col items-center justify-center gap-3 sm:grid-cols-2-auto'>
          {randomCards.map((flashCard) => (
            <FlashCardComponent
              key={flashCard.frontUuid}
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

      <div className='absolute bottom-0 right-0 z-40 flex h-40 w-full flex-col items-center justify-center gap-4 bg-gray-200/10 backdrop-blur-md dark:bg-slate-950/10 sm:bottom-32'>
        <ButtonComponent
          label={'Reshuffle'}
          icon={<ArrowPathIcon className='h-4 w-4' />}
          iconPosition={'right'}
          class={
            'max-w-80 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 dark:bg-green-500 dark:hover:bg-green-400 md:h-10 md:!w-52'
          }
          onClick={reshuffleFlashCards}
        />

        <DropdownComponent
          items={dropdownItems}
          defaultValue={dropdownItems[0]}
          onChange={(value) => changeReviseType(value)}
        />
      </div>
    </div>
  ) : (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-xl'>
      <h3 className='text-gray-500 dark:text-slate-200'>
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
