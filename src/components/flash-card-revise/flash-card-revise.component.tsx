'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import { Button } from '#/components/ui/button/button.component';
import Dropdown from '#/components/ui/dropdown/dropdown.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useKeyPress from '#/hooks/use-key-press.hook';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import { reviseTypeDictionary } from '#/shared/dictionaries/revise-type.dictionary';
import { FlashCardTypesEnum } from '#/shared/enums/flash-card-types.enum';
import { FlashCard } from '#/shared/models/flash-card.model';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import { updateFlashCard } from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import FlashCardComponent from '../flash-card/flash-card.component';
import LinkComponent from '../ui/link/link.component';

export default function FlashCardReviseComponent() {
  const [reviseType, setReviseType] = useState(
    FlashCardTypesEnum.GUESS_DEFINITION,
  );
  const [revisedCard, setRevisedCard] = useState<FlashCard>();
  const [clickedCard, setClickedCard] = useState<FlashCard>();
  const [dropdownItems] = useState(reviseTypeDictionary);
  const [clicked, setClicked] = useState(false);

  const flashCardsArray = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  );
  const statistics = useAppSelector(statsSelectors.selectStats);

  const dispatch = useAppDispatch();

  const { pickedItems: randomCards, reshuffle } =
    useRandomArrayItems<FlashCard>(
      flashCardsArray,
      flashCardsArray.map((item) => item.weight),
      4,
    );

  const isCorrect = (flashCard?: FlashCard) => {
    const comparisonItem = flashCard ?? clickedCard;

    return revisedCard === comparisonItem;
  };

  const changeClicked = (flashCard: FlashCard) => {
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

  useKeyPress(['r', 'ArrowRight'], reshuffleFlashCards);
  useKeyPress(['1'], () => changeClicked(randomCards[0]));
  useKeyPress(['2'], () => changeClicked(randomCards[1]));
  useKeyPress(['3'], () => changeClicked(randomCards[2]));
  useKeyPress(['4'], () => changeClicked(randomCards[3]));

  return flashCardsArray.length > 0 ? (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-44'>
        <div
          className={`text-default mb-2 flex h-auto min-h-16 w-full flex-col items-center justify-center gap-4 px-4 text-center`}
        >
          {reviseType === FlashCardTypesEnum.GUESS_DEFINITION &&
            revisedCard && <h5 className='text-default'>{revisedCard.word}</h5>}

          {reviseType === FlashCardTypesEnum.GUESS_NAME && revisedCard && (
            <h5 className='text-default'>{revisedCard.definition}</h5>
          )}
        </div>

        <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4 lg:grid-cols-[repeat(auto-fit,minmax(25rem,1fr))]'>
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

      <div className='fixed bottom-4 right-0 z-40 flex h-40 w-full flex-col items-center justify-center gap-4 bg-gray-200/10 backdrop-blur-md dark:bg-slate-950/10 sm:sticky sm:bottom-8 md:bottom-24'>
        <Button
          label={'Reshuffle'}
          icon={<ArrowPathIcon className='h-4 w-4' />}
          iconPosition={'right'}
          onClick={reshuffleFlashCards}
          size={'xlg'}
        />

        <Dropdown<FlashCardTypesEnum>
          config={dropdownItems}
          value={FlashCardTypesEnum.GUESS_DEFINITION}
          onChange={(value) => changeReviseType(value)}
          contextPosition={'top'}
          labelClassName='max-w-80 md:max-w-52'
        />
      </div>
    </div>
  ) : (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-xl'>
      <h3 className='text-gray-500 dark:text-slate-200'>
        You dont have any flashcards yet.
      </h3>

      <LinkComponent
        href='/flashcards/learn'
        label=' You can add them here'
        className='text-green-400 underline'
      />
    </div>
  );
}
