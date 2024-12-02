'use client';

import {
  ArrowPathIcon,
  ArrowTurnLeftDownIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import useRandomArrayItems from '#/hooks/use-random-array-items.hook';
import type { FlashCard } from '#/shared/models/flash-card.model';
import FlashCardComponent from '../flash-card/flash-card';
import { Button } from '#/components/_ui/button/button';
import { useAppContext } from '#/providers/app-context';
import useKeyPress from '#/hooks/use-key-press.hook';
import Dropdown from '../_ui/dropdown/dropdown';
import LinkComponent from '../_ui/link/link';
import { cn } from '#/shared/utils/cn.util';
import Card from '../_ui/card/card';

export default function FlashCardReviseComponent() {
  const defaultSet = { value: 'default', label: 'All flash cards' };

  const [revisedCard, setRevisedCard] = useState<FlashCard>();
  const [revisedSet, setRevisedSet] = useState<string>(defaultSet.value);
  const [clickedCard, setClickedCard] = useState<FlashCard>();
  const [clicked, setClicked] = useState(false);

  const {
    sets,
    setsDictionary,
    flashcards,
    updateFlashCard,
    metadata,
    updateMetadata,
  } = useAppContext();

  const {
    pickedItems: randomCards,
    reshuffle,
    setNewArray,
  } = useRandomArrayItems<FlashCard>(flashcards, 4);

  const isCorrect = (flashCard?: FlashCard) => {
    const comparisonItem = flashCard ?? clickedCard;

    return revisedCard === comparisonItem;
  };

  const changeClicked = (flashCard: FlashCard, key?: string) => {
    if (key) {
      window.umami.track('Answer clicked', { key });
    } else {
      window.umami.track('Answer clicked', { key: null });
    }

    if (clicked) {
      return;
    }

    const correct = isCorrect(flashCard);
    const clonedStats = { ...metadata };

    clonedStats.answers += 1;

    if (correct) {
      clonedStats.correctAnswers += 1;
      if (revisedCard && revisedCard?.weight > 0.01) {
        updateFlashCard({
          ...flashCard,
          weight: +(flashCard.weight - 0.01).toFixed(2),
        });
      }
    } else {
      clonedStats.incorrectAnswers += 1;

      updateFlashCard({
        ...flashCard,
        weight: +(flashCard.weight + 0.01).toFixed(2),
      });
    }

    clonedStats.accuracy = parseFloat(
      (clonedStats.correctAnswers / clonedStats.answers).toFixed(2),
    );

    updateMetadata({ ...clonedStats });
    setClickedCard(flashCard);
    setClicked(true);
  };

  const reshuffleFlashCards = () => {
    window.umami.track('Reshuffle flash cards', { key: null });

    setClickedCard(undefined);
    setRevisedCard(undefined);
    setClicked(false);

    reshuffle();
  };

  const reshuffleFlashCardsWithKey = (key: string) => {
    window.umami.track('Reshuffle flash cards', { key });
    reshuffleFlashCards();
  };

  const changeRevisedSet = (value: string) => {
    window.umami.track('Change revised set', { value });
    setClicked(false);
    setRevisedSet(value);
  };

  useEffect(() => {
    const isFullRevise = randomCards.length === 4;
    const randomMax = isFullRevise ? 3 : randomCards.length - 1;

    setRevisedCard(randomCards[getRandomRangedNumber(0, randomMax)]);
  }, [randomCards]);

  useEffect(() => {
    if (clicked) return;

    if (revisedSet === defaultSet.value) {
      setNewArray(flashcards);
    } else {
      const setFlashCards = sets.filter(
        (set) => set.frontUuid === revisedSet,
      )[0].flashCards;

      setNewArray(setFlashCards);
    }

    reshuffle();
  }, [revisedSet, flashcards]);

  useKeyPress(['r'], () => reshuffleFlashCardsWithKey('r'));
  useKeyPress(['ArrowRight'], () => reshuffleFlashCardsWithKey('ArrowRight'));
  useKeyPress(['1'], () => changeClicked(randomCards[0], '1'));
  useKeyPress(['2'], () => changeClicked(randomCards[1], '2'));
  useKeyPress(['3'], () => changeClicked(randomCards[2], '3'));
  useKeyPress(['4'], () => changeClicked(randomCards[3], '4'));

  return flashcards.length > 0 ? (
    <div className='flex h-full w-full flex-col justify-stretch'>
      <div className='flex h-full w-full flex-col items-center gap-8 pb-44'>
        <div className='grid w-full items-center justify-center'>
          <div
            className={cn([
              'flex w-full items-center justify-end gap-2 opacity-0 transition md:translate-x-20',
              clicked && 'opacity-100',
            ])}
          >
            <ArrowTurnLeftDownIcon className='size-5 text-green-400' />

            <span className='w-32 text-xs italic text-gray-600 dark:text-slate-500'>
              Click on the card to flip it
            </span>
          </div>

          <div>
            {revisedCard ? (
              <FlashCardComponent
                key={revisedCard.frontUuid}
                flashCard={revisedCard}
                flipBlocked={!clicked}
              />
            ) : (
              <Card className='h-96 w-80' />
            )}
          </div>
        </div>

        <div className='mt-8 grid gap-2 xl:grid-cols-[repeat(2,minmax(20rem,1fr))]'>
          {randomCards.map((flashCard, index) => (
            <div
              className={cn([
                clickedCard?.frontUuid === flashCard.frontUuid &&
                  isCorrect(flashCard) &&
                  'border-green-400/50 bg-green-100 hover:!bg-green-100 dark:!border-green-400/40 dark:bg-green-400/20 dark:hover:!bg-green-400/20',
                clickedCard?.frontUuid === flashCard.frontUuid &&
                  !isCorrect(flashCard) &&
                  'border-red-400/50 bg-red-100 hover:!bg-red-100 dark:!border-red-400/40 dark:bg-red-400/20 dark:hover:!bg-red-400/20',
                'flex w-[320px] cursor-pointer gap-4 rounded-md border border-gray-200 p-4 transition hover:bg-gray-100 dark:dark:border-slate-800/40 dark:hover:bg-slate-800',
              ])}
              key={`answer-${flashCard.frontUuid}`}
              onClick={() => changeClicked(flashCard)}
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

      <div className='fixed bottom-0 right-0 z-40 flex h-36 w-full flex-col items-center justify-center gap-4 bg-gray-200/10 px-2 backdrop-blur-md dark:bg-slate-950/10 sm:sticky sm:bottom-8'>
        <Button
          label={'Reshuffle'}
          icon={<ArrowPathIcon className='h-4 w-4' />}
          iconPosition={'right'}
          onClick={reshuffleFlashCards}
          size={'xlg'}
          className='!w-full !max-w-xs'
        />

        <Dropdown
          config={[defaultSet, ...setsDictionary]}
          onChange={changeRevisedSet}
          value={defaultSet.value}
          contextPosition={'top'}
          labelClassName='max-w-xs'
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
