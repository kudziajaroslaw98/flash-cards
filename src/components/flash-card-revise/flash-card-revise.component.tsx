'use client';

import {
  ArrowPathIcon,
  ArrowTurnLeftDownIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import { Button } from '#/components/ui/button/button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useKeyPress from '#/hooks/use-key-press.hook';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import { FlashCard } from '#/shared/models/flash-card.model';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import { updateFlashCard } from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import FlashCardComponent from '../flash-card/flash-card.component';
import LinkComponent from '../ui/link/link.component';

export default function FlashCardReviseComponent() {
  const [revisedCard, setRevisedCard] = useState<FlashCard>();
  const [clickedCard, setClickedCard] = useState<FlashCard>();
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
        <div className='grid w-full items-center justify-center'>
          <div className='flex w-full items-center justify-end gap-2 md:translate-x-20'>
            <ArrowTurnLeftDownIcon className='size-5 text-green-400' />
            <span className='w-32 text-xs italic text-gray-600 dark:text-slate-500'>
              Click on the card to flip it
            </span>
          </div>

          <div>
            {revisedCard && (
              <FlashCardComponent
                key={revisedCard.frontUuid}
                flashCard={revisedCard}
              />
            )}
          </div>
        </div>

        <div className='mt-8 grid gap-2 xl:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
          {randomCards.map((flashCard, index) => (
            <div
              className='flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800'
              key={`answer-${flashCard.frontUuid}`}
            >
              <span className='flex size-8 min-h-8 min-w-8 items-center justify-center rounded-md bg-green-400 text-gray-100 dark:text-slate-900'>
                {index + 1}
              </span>
              <span className='flex w-[280px] text-sm text-gray-800 dark:text-slate-400'>
                {flashCard.answer}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className='fixed bottom-4 right-0 z-40 flex h-40 w-full flex-col items-center justify-center gap-4 bg-gray-200/10 backdrop-blur-md dark:bg-slate-950/10 sm:sticky sm:bottom-8'>
        <Button
          label={'Reshuffle'}
          icon={<ArrowPathIcon className='h-4 w-4' />}
          iconPosition={'right'}
          onClick={reshuffleFlashCards}
          size={'xlg'}
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
