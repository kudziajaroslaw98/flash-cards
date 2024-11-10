'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter.component';
import { Button } from '#/components/ui/button/button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import type { FlashCard } from '#/shared/models/flash-card.model';

import { cn } from '#/shared/utils/cn.util';
import {
  addNewFlashCards,
  removeFlashCards,
  updateFlashCards,
} from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import { AnimatePresence, m } from 'framer-motion';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import FlashCardComponent from '../flash-card/flash-card.component';

const NewFlashCardModal = dynamic(() =>
  import(
    '#/components/new-flash-card-modal/new-flash-card-modal.component'
  ).then((x) => x.NewFlashCardModal),
);

export default function FlashCardsTable() {
  const statistics = useAppSelector(statsSelectors.selectStats);
  const flashCardsArray = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  ).sort((head, tail) => head.order - tail.order);
  const dispatch = useAppDispatch();

  const [selected, setSelected] = useState<FlashCard[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [tileSize] = useState<'sm' | 'md' | 'lg'>('sm');

  const isSelected = (flashCard: FlashCard) => {
    return (
      selected.findIndex((item) => item.frontUuid === flashCard.frontUuid) !==
      -1
    );
  };

  const toggleSelected = (flashCard: FlashCard) => {
    if (isSelected(flashCard)) {
      setSelected((prev) =>
        prev.filter((item) => flashCard.frontUuid !== item.frontUuid),
      );
    } else {
      setSelected((prev) => [...prev, flashCard]);
    }
  };

  const removeSelected = () => {
    posthog.capture('Remove flash cards', { count: selected.length });
    dispatch(removeFlashCards(selected.map((item) => item.frontUuid)));
    setSelected([]);
  };

  const addNewRecord = (flashCards: Partial<FlashCard>[]) => {
    posthog.capture('Add flash cards', { count: flashCards.length });
    dispatch(addNewFlashCards(flashCards));

    dispatch(
      updateStatistics({
        updatedValue: statistics.createdFlashCards + flashCards.length,
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

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  const editSelectedRecords = (editRecords: Partial<FlashCard>[]) => {
    posthog.capture('Edit flash cards', { count: editRecords.length });
    dispatch(updateFlashCards(editRecords));
  };

  const handleEditButtonClick = () => {
    posthog.capture('Edit flashcards clicked');
    setIsInEditMode(true);
  };

  const handleAddButtonClick = () => {
    posthog.capture('Add flashcards clicked');
    setIsInEditMode(false);
  };

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashCardsCounterComponent count={flashCardsArray.length} />
      {flashCardsArray.length > 0 && (
        <div
          className={cn([
            'grid w-full justify-center gap-4',
            tileSize === 'sm' && 'grid-cols-[repeat(auto-fit,11rem)]',
            tileSize === 'md' && 'grid-cols-[repeat(auto-fit,16rem)]',
            tileSize === 'lg' && 'grid-cols-[repeat(auto-fit,20rem)]',
          ])}
        >
          <AnimatePresence mode='popLayout'>
            {flashCardsArray.map((flashCard) => (
              <div key={flashCard.frontUuid}>
                <FlashCardComponent
                  flashCard={flashCard}
                  size={tileSize}
                  isSelected={isSelected(flashCard)}
                  onSelect={() => toggleSelected(flashCard)}
                  isInSelectionMode={isInSelectionMode}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <m.div
        layout
        className='flex w-full flex-col items-center justify-center gap-4 md:flex-row'
      >
        <NewFlashCardModal
          handleNewFlashCard={addNewRecord}
          handleEditFlashCard={editSelectedRecords}
          selectedFlashCards={isInEditMode ? selected : []}
          isInEditMode={isInEditMode}
          trigger={
            <Button
              onClick={handleAddButtonClick}
              icon={<PlusIcon className='h-4 w-4' />}
              size={'icon'}
            />
          }
        />

        <NewFlashCardModal
          handleNewFlashCard={addNewRecord}
          handleEditFlashCard={editSelectedRecords}
          selectedFlashCards={isInEditMode ? selected : []}
          isInEditMode={isInEditMode}
          trigger={
            <Button
              onClick={handleEditButtonClick}
              icon={<PencilIcon className='h-4 w-4' />}
              size={'icon'}
              disabled={selected.length === 0}
              variant={'secondary'}
            />
          }
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
      </m.div>
    </div>
  );
}
