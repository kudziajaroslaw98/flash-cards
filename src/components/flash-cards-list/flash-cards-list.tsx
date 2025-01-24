'use client';

import '#/shared/utils/polyfills';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';

import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import { Button } from '#/components/_ui/button/button';
import Dropdown from '#/components/_ui/dropdown/dropdown';
import Input from '#/components/_ui/input/input';
import FlashcardComponent from '#/components/flash-card/flash-card';
import FlashcardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { NewFlashcardModal } from '#/components/new-flash-card-modal/new-flash-card-modal';

import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';

import { Pencil, Plus, Search, Trash } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function FlashcardsList() {
  const {
    flashcards,
    setsDictionary,
    flashcardTypeDictionaries,
    removeFlashcards,
    addFlashcards,
    updateFlashcards,
    metadata,
    updateMetadata,
  } = useAppContext();

  const [selected, setSelected] = useState<Flashcard[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [tileSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [searchedText, setSearchedText] = useState('');
  const [searchedSets, setSearchedSets] = useState<Array<string>>([]);
  const [searchedType, setSearchedType] = useState<Flashcard['type'][]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);

  const isSelected = useCallback(
    (flashcard: Flashcard) => {
      return (
        selected.findIndex((item) => item.frontUuid === flashcard.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (flashcard: Flashcard) => {
      if (isSelected(flashcard)) {
        setSelected((prev) =>
          prev.filter((item) => flashcard.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, flashcard]);
      }
    },
    [isSelected],
  );

  const removeSelected = () => {
    window.umami.track('Remove flashcards', { count: selected.length });
    removeFlashcards(selected);
    setSelected([]);
  };

  const addNewRecord = (flashcards: Partial<Flashcard>[]) => {
    window.umami.track('Add flashcards', { count: flashcards.length });
    addFlashcards(flashcards);

    updateMetadata({
      ...metadata,
      createdFlashCards: metadata.createdFlashCards + flashcards.length,
    });

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

  const editSelectedRecords = (editRecords: Partial<Flashcard>[]) => {
    window.umami.track('Edit flashcards', { count: editRecords.length });
    updateFlashcards(editRecords);
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
    const tmpFlashcards = flashcards
      .filter(
        (flashcard) =>
          flashcard.query
            ?.toLowerCase()
            ?.includes(searchedText.toLowerCase()) ||
          flashcard?.definition
            ?.toLowerCase()
            ?.includes(searchedText.toLowerCase()) ||
          flashcard.context
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

    setFilteredFlashcards(tmpFlashcards);
  };

  const handleSearchedTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value);
  };

  const handleSetsChange = (sets: Array<string>) => {
    setSearchedSets(sets);
  };

  const handleTypesChange = (types: Array<FlashcardType>) => {
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
      <FlashcardsCounterComponent count={flashcards.length} />

      <div className='flex w-full flex-col flex-wrap items-center justify-center gap-2 text-sm sm:flex-row sm:justify-end'>
        <span className='flex w-full justify-center sm:w-auto'>
          <Input
            type='text'
            value={searchedText}
            valid={true}
            placeholder='Search in flashcards...'
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
            config={flashcardTypeDictionaries}
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
              'grid w-full justify-center gap-4',
              filteredFlashcards.length > 5
                ? 'xl:justify-between'
                : 'justify-start',
              tileSize === 'sm' && 'grid-cols-[repeat(auto-fit,11rem)]',
              tileSize === 'md' && 'grid-cols-[repeat(auto-fit,11rem)]',
              tileSize === 'lg' && 'grid-cols-[repeat(auto-fit,16rem)]',
            ])}
          >
            <AnimatePresence mode='popLayout'>
              {filteredFlashcards.map((flashcard) => (
                <div key={flashcard.frontUuid}>
                  <FlashcardComponent
                    flashcard={flashcard}
                    size={tileSize}
                    isSelected={isSelected(flashcard)}
                    onSelect={() => toggleSelected(flashcard)}
                    isInSelectionMode={isInSelectionMode}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <FloatingButtons className='mt-4'>
          <NewFlashcardModal
            handleNewFlashcard={addNewRecord}
            handleEditFlashcard={editSelectedRecords}
            selectedFlashcards={isInEditMode ? selected : []}
            isInEditMode={isInEditMode}
            trigger={
              <Button
                onClick={handleAddButtonClick}
                icon={<Plus className='h-4 w-4' />}
                size={'icon-square'}
                alt='Add new flashcards'
              />
            }
          />

          {flashcards.length > 0 && (
            <>
              <NewFlashcardModal
                handleNewFlashcard={addNewRecord}
                handleEditFlashcard={editSelectedRecords}
                selectedFlashcards={isInEditMode ? selected : []}
                isInEditMode={isInEditMode}
                trigger={
                  <Button
                    onClick={handleEditButtonClick}
                    icon={<Pencil className='h-4 w-4' />}
                    size={'icon-square'}
                    disabled={selected.length === 0}
                    variant={'secondary'}
                    alt='Edit flashcards'
                  />
                }
              />
              <AlertDialog
                onCancel={() => {
                  window.umami.track('Cancel remove flashcards');
                }}
                headerText='Are you absolutely sure?'
                bodyText='This action cannot be undone. This will permanently delete your flashcards.'
                trigger={
                  <Button
                    disabled={selected.length === 0}
                    variant={'destructive'}
                    icon={<Trash className='h-4 w-4' />}
                    size={'icon-square'}
                    alt='Remove flashcards'
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
