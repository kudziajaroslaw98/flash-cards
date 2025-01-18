'use client';

import '#/shared/utils/polyfills';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';

import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import { Button } from '#/components/_ui/button/button';
import Dropdown from '#/components/_ui/dropdown/dropdown';
import Input from '#/components/_ui/input/input';
import FlashCardComponent from '#/components/flash-card/flash-card';
import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { NewFlashCardModal } from '#/components/new-flash-card-modal/new-flash-card-modal';

import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { FlashCard, FlashCardType } from '#/types/flash-card.type';

import { Pencil, Plus, Search, Trash } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function FlashCardsList() {
  const {
    flashcards,
    setsDictionary,
    flashCardTypeDictionaries,
    removeFlashCards,
    addFlashCards,
    updateFlashCards,
    metadata,
    updateMetadata,
  } = useAppContext();

  const [selected, setSelected] = useState<FlashCard[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [tileSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [searchedText, setSearchedText] = useState('');
  const [searchedSets, setSearchedSets] = useState<Array<string>>([]);
  const [searchedType, setSearchedType] = useState<FlashCard['type'][]>([]);
  const [filteredFlashCards, setFilteredFlashCards] = useState<FlashCard[]>([]);

  const isSelected = useCallback(
    (flashCard: FlashCard) => {
      return (
        selected.findIndex((item) => item.frontUuid === flashCard.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (flashCard: FlashCard) => {
      if (isSelected(flashCard)) {
        setSelected((prev) =>
          prev.filter((item) => flashCard.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, flashCard]);
      }
    },
    [isSelected],
  );

  const removeSelected = () => {
    window.umami.track('Remove flash cards', { count: selected.length });
    removeFlashCards(selected);
    setSelected([]);
  };

  const addNewRecord = (flashCards: Partial<FlashCard>[]) => {
    window.umami.track('Add flash cards', { count: flashCards.length });
    addFlashCards(flashCards);

    updateMetadata({
      ...metadata,
      createdFlashCards: metadata.createdFlashCards + flashCards.length,
    });

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

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

  const handleFilterWithMultipleCryteria = () => {
    const tmpFlashCards = flashcards
      .filter(
        (flashcard) =>
          flashcard.question
            ?.toLowerCase()
            ?.includes(searchedText.toLowerCase()) ||
          flashcard?.answer
            ?.toLowerCase()
            ?.includes(searchedText.toLowerCase()) ||
          flashcard.questionAddition
            ?.toLowerCase()
            ?.includes(searchedText.toLowerCase()) ||
          searchedText === '',
      )
      .filter(
        (flashcard) =>
          flashcard?.sets?.extendedIncludes(searchedSets) ||
          searchedSets.length === 0,
      )
      .filter(
        (flashcard) =>
          searchedType?.includes(flashcard.type) || searchedType.length === 0,
      );

    setFilteredFlashCards(tmpFlashCards);
  };

  const handleSearchedTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value);
  };

  const handleSetsChange = (sets: Array<string>) => {
    setSearchedSets(sets);
  };

  const handleTypesChange = (types: Array<FlashCardType>) => {
    setSearchedType(types);
  };

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  useEffect(() => {
    handleFilterWithMultipleCryteria();
  }, [searchedText, searchedSets, searchedType, flashcards]);

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashCardsCounterComponent count={flashcards.length} />

      <div className='flex w-full flex-col flex-wrap items-center justify-center gap-2 text-sm sm:flex-row sm:justify-end'>
        <span className='flex w-full justify-center sm:w-auto'>
          <Input
            type='text'
            value={searchedText}
            valid={true}
            placeholder='Search in decks...'
            for='search'
            icon={<Search className='h-4 w-4' />}
            className='!w-full !max-w-80 sm:!w-56'
            onChange={handleSearchedTextChange}
          />
        </span>

        <span className='flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row'>
          <Dropdown
            config={setsDictionary}
            onChange={handleSetsChange}
            multipleLabel='Sets'
            label='Sets'
            labelClassName='!w-full !max-w-80 sm:!w-56'
            searchable
            clearAll
            multiple
          />

          <Dropdown
            config={flashCardTypeDictionaries}
            onChange={handleTypesChange}
            multipleLabel='Types'
            label='All Types'
            labelClassName='!w-full !max-w-80 sm:!w-56'
            multiple
          />
        </span>
      </div>

      <div className='relative flex h-full w-full flex-col'>
        {flashcards.length > 0 && (
          <div
            className={cn([
              'grid w-full justify-center gap-4 lg:justify-between',
              tileSize === 'sm' && 'grid-cols-[repeat(auto-fit,11rem)]',
              tileSize === 'md' && 'grid-cols-[repeat(auto-fit,11rem)]',
              tileSize === 'lg' && 'grid-cols-[repeat(auto-fit,16rem)]',
            ])}
          >
            <AnimatePresence mode='popLayout'>
              {filteredFlashCards.map((flashCard) => (
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

        <FloatingButtons className='mt-4'>
          <NewFlashCardModal
            handleNewFlashCard={addNewRecord}
            handleEditFlashCard={editSelectedRecords}
            selectedFlashCards={isInEditMode ? selected : []}
            isInEditMode={isInEditMode}
            trigger={
              <Button
                onClick={handleAddButtonClick}
                icon={<Plus className='h-4 w-4' />}
                size={'icon-square'}
                alt='Add new flash cards'
              />
            }
          />

          {flashcards.length > 0 && (
            <>
              <NewFlashCardModal
                handleNewFlashCard={addNewRecord}
                handleEditFlashCard={editSelectedRecords}
                selectedFlashCards={isInEditMode ? selected : []}
                isInEditMode={isInEditMode}
                trigger={
                  <Button
                    onClick={handleEditButtonClick}
                    icon={<Pencil className='h-4 w-4' />}
                    size={'icon-square'}
                    disabled={selected.length === 0}
                    variant={'secondary'}
                    alt='Edit flash cards'
                  />
                }
              />
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
                    icon={<Trash className='h-4 w-4' />}
                    size={'icon-square'}
                    alt='Remove flash cards'
                  />
                }
                onAccept={removeSelected}
              />
            </>
          )}
        </FloatingButtons>
      </div>
    </div>
  );
}
