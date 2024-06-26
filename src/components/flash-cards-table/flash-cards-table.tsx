'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter.component';
import EditableFlashCardRowComponent from '#/components/flash-cards-table/editable-flash-card-row.component';
import { Button } from '#/components/ui/button/button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCardModel } from '#/shared/models/flash-card.model';
import { UUID } from '#/shared/types/uuid.type';

import {
  addNewFlashCard,
  removeFlashCards,
  updateFlashCard,
} from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';

export default function FlashCardsTable() {
  const statistics = useAppSelector(statsSelectors.selectStats);
  const flashCardsArray = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  ).sort((head, tail) => head.order - tail.order);
  const dispatch = useAppDispatch();

  const [selected, setSelected] = useState<UUID[]>([]);

  const isSelected = (flashCard: FlashCardModel) => {
    return selected.includes(flashCard.frontUuid);
  };

  const toggleSelected = (flashCard: FlashCardModel) => {
    const isFlashCardSelected = selected.includes(flashCard.frontUuid);

    if (isFlashCardSelected) {
      setSelected((prev) =>
        prev.filter((item) => flashCard.frontUuid !== item),
      );
    } else {
      setSelected((prev) => [...prev, flashCard.frontUuid]);
    }
  };

  const removeSelected = () => {
    dispatch(removeFlashCards(selected));
    setSelected([]);
  };

  const addNewRecord = () => {
    dispatch(addNewFlashCard());

    dispatch(
      updateStatistics({
        updatedValue: statistics.createdFlashCards + 1,
        property: 'createdFlashCards',
      }),
    );

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

  const wordChange = (flashCard: FlashCardModel, value: string) => {
    dispatch(
      updateFlashCard({ flashCard, updatedValue: value, property: 'word' }),
    );
  };

  const definitionChange = (flashCard: FlashCardModel, value: string) => {
    dispatch(
      updateFlashCard({
        flashCard,
        updatedValue: value,
        property: 'definition',
      }),
    );
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
                  key={flashCard.frontUuid}
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
        <Button
          onClick={addNewRecord}
          icon={<PlusIcon className='h-4 w-4' />}
          size={'icon'}
        />

        {flashCardsArray.length > 0 && (
          <Button
            disabled={selected.length === 0}
            onClick={removeSelected}
            variant={'destructive'}
            icon={<TrashIcon className='h-4 w-4' />}
            size={'icon'}
          />
        )}
      </div>
    </div>
  );
}
