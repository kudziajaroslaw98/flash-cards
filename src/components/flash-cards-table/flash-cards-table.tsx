'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { UUID } from 'node:crypto';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter.component';
import EditableFlashCardRowComponent from '#/components/flash-cards-table/editable-flash-card-row.component';
import ButtonComponent from '#/components/ui/button/button.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_STATS } from '#/utils/defaults/stats.default';
import typedInstanceFactory from '#/utils/functions/typed-instance-factory.util';
import { FlashCardModel } from '#/utils/models/flash-card.model';
import { FlashCards } from '#/utils/types/local-storage-flash-card.type';

export default function FlashCardsTable() {
  const flashCardSort = (head: FlashCardModel, tail: FlashCardModel) =>
    head.order - tail.order;

  const {
    value: flashCards,
    arrayOfValues: flashCardsArray,
    setToLocalStorage: setFlashCards,
  } = useLocalStorage<FlashCardModel, FlashCards>('words', {}, flashCardSort);
  const { value: statistics, setToLocalStorage: setStatistics } =
    useLocalStorage('stats', DEFAULT_STATS);

  const [selected, setSelected] = useState<UUID[]>([]);

  const isSelected = (flashCard: FlashCardModel) => {
    return selected.includes(flashCard.uuid);
  };

  const toggleSelected = (flashCard: FlashCardModel) => {
    const isFlashCardSelected = selected.includes(flashCard.uuid);

    if (isFlashCardSelected) {
      setSelected(selected.filter((item) => flashCard.uuid !== item));
    } else {
      setSelected([...selected, flashCard.uuid]);
    }
  };

  const removeSelected = () => {
    const flashCardsClone = { ...flashCards };

    selected.forEach((flashCardUuid) => {
      delete flashCardsClone?.[flashCardUuid];
    });

    Object.values(flashCardsClone).forEach((flashCard, index) => {
      flashCard.order = index;
    });

    setSelected([]);
    setFlashCards(flashCardsClone);
  };

  const addNewRecord = () => {
    const flashCardsClone = { ...flashCards };
    const clonedStats = { ...statistics };
    const newUuid = uuid() as UUID;
    const newFlashCards = typedInstanceFactory(flashCardsClone, {
      [newUuid]: {
        uuid: newUuid,
        word: 'new-word',
        definition: 'new-definition',
        order: flashCardsArray.length,
        weight: 0.5,
      },
    });

    clonedStats.createdFlashCards += 1;

    setFlashCards(newFlashCards);
    setStatistics(clonedStats);
    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

  const wordChange = (flashCard: FlashCardModel, value: string) => {
    const flashCardsClone = { ...flashCards };

    flashCardsClone[flashCard.uuid] = { ...flashCard, word: value };

    setFlashCards(flashCardsClone);
  };

  const definitionChange = (flashCard: FlashCardModel, value: string) => {
    const flashCardsClone = { ...flashCards };

    flashCardsClone[flashCard.uuid] = { ...flashCard, definition: value };

    setFlashCards(flashCardsClone);
  };

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashCardsCounterComponent count={flashCardsArray.length} />

      {flashCardsArray.length > 0 && (
        <table className='flex h-auto w-full flex-col gap-1'>
          <thead>
            <tr className='flex w-full text-sm text-gray-500 dark:text-slate-300'>
              <th className='min-w-12 pl-2 text-left'>Id</th>

              <th className='flex min-w-44 flex-col pl-2 text-left md:flex-row'>
                <span className=''>Word</span>
                <span className='flex md:hidden'>Definition</span>
              </th>

              <th className='hidden w-full pl-2 text-left md:flex'>
                Definition
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {flashCardsArray.map((flashCard, index) => (
                <EditableFlashCardRowComponent
                  key={flashCard.uuid}
                  flashCard={flashCard}
                  definitionChange={definitionChange}
                  wordChange={wordChange}
                  index={index}
                  isSelected={isSelected}
                  toggleSelected={toggleSelected}
                ></EditableFlashCardRowComponent>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )}

      <div className='flex w-full flex-col items-center justify-center gap-4 md:flex-row'>
        <ButtonComponent
          class='w-full bg-green-400 py-2 hover:bg-green-500 active:focus:bg-green-600 md:h-12 dark:bg-green-500 dark:hover:bg-green-500 dark:active:focus:bg-green-700'
          onClick={addNewRecord}
        >
          <PlusIcon className='h-4 w-4' />
        </ButtonComponent>

        {flashCardsArray.length > 0 && (
          <ButtonComponent
            class='w-full bg-red-400 py-2 hover:bg-red-500 active:focus:bg-red-600 md:h-12 dark:bg-red-500 dark:hover:bg-red-600 dark:active:focus:bg-red-700'
            disabled={selected.length === 0}
            onClick={removeSelected}
          >
            <TrashIcon className='h-4 w-4' />
          </ButtonComponent>
        )}
      </div>
    </div>
  );
}
