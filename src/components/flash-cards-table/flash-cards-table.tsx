'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter';
import type { FlashCard } from '#/shared/models/flash-card.model';
import { Button } from '#/components/_ui/button/button';

import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { AlertDialog } from '../_ui/alert-dialog/alert-dialog';
import FlashCardComponent from '../flash-card/flash-card';
import { useAppContext } from '#/providers/app-context';
import { AnimatePresence } from 'framer-motion';
import { cn } from '#/shared/utils/cn.util';
import dynamic from 'next/dynamic';

const NewFlashCardModal = dynamic(() =>
  import('#/components/new-flash-card-modal/new-flash-card-modal').then(
    (x) => x.NewFlashCardModal,
  ),
);

export default function FlashCardsTable() {
  const {
    flashcards,
    removeFlashCards,
    addFlashCards,
    updateFlashCards,
    stats,
    updateStats,
  } = useAppContext();

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
    window.umami.track('Remove flash cards', { count: selected.length });
    removeFlashCards(selected);
    setSelected([]);
  };

  const addNewRecord = (flashCards: Partial<FlashCard>[]) => {
    window.umami.track('Add flash cards', { count: flashCards.length });
    addFlashCards(flashCards);

    updateStats({
      ...stats,
      createdFlashCards: stats.createdFlashCards + flashCards.length,
    });

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
    window.umami.track('Edit flash cards', { count: editRecords.length });
    updateFlashCards(editRecords);
  };

  const handleEditButtonClick = () => {
    window.umami.track('Edit flashcards clicked');
    setIsInEditMode(true);
  };

  const handleAddButtonClick = () => {
    window.umami.track('Add flashcards clicked');
    setIsInEditMode(false);
  };

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashCardsCounterComponent count={flashcards.length} />

      <div className='relative flex h-full w-full flex-col'>
        {flashcards.length > 0 && (
          <div
            className={cn([
              'grid w-full justify-center gap-4',
              tileSize === 'sm' && 'grid-cols-[repeat(auto-fit,11rem)]',
              tileSize === 'md' && 'grid-cols-[repeat(auto-fit,16rem)]',
              tileSize === 'lg' && 'grid-cols-[repeat(auto-fit,20rem)]',
            ])}
          >
            <AnimatePresence mode='popLayout'>
              {flashcards.map((flashCard) => (
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

        <FloatingButtons>
          <NewFlashCardModal
            handleNewFlashCard={addNewRecord}
            handleEditFlashCard={editSelectedRecords}
            selectedFlashCards={isInEditMode ? selected : []}
            isInEditMode={isInEditMode}
            trigger={
              <Button
                onClick={handleAddButtonClick}
                icon={<PlusIcon className='h-4 w-4' />}
                size={'icon-square'}
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
                size={'icon-square'}
                disabled={selected.length === 0}
                variant={'secondary'}
              />
            }
          />

          {flashcards.length > 0 && (
            <AlertDialog
              onCancel={() => {
                window.umami.track('Cancel remove flash cards');
              }}
              headerText='Are you absolutely sure?'
              bodyText='This action cannot be undone. This will permanently delete your flash cards.'
              trigger={
                <Button
                  disabled={selected.length === 0}
                  variant={'destructive'}
                  icon={<TrashIcon className='h-4 w-4' />}
                  size={'icon-square'}
                />
              }
              onAccept={removeSelected}
            />
          )}
        </FloatingButtons>
      </div>
    </div>
  );
}
