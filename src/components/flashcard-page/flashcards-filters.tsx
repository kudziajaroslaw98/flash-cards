'use client';

import { useAppContext } from '#/providers/app-context';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import Dropdown from '../_ui/dropdown/dropdown';
import Input from '../_ui/input/input';

export default function FlashcardsFilters({
  setFilteredFlashcards,
  setSelected,
}: {
  setFilteredFlashcards: (flashcards: Flashcard[]) => void;
  setSelected: (flashcards: Flashcard[]) => void;
}) {
  const [searchedText, setSearchedText] = useState('');
  const [searchedSets, setSearchedSets] = useState<Array<string>>([]);
  const [searchedType, setSearchedType] = useState<Flashcard['type'][]>([]);

  const { flashcards, setsDictionary, flashcardTypeDictionaries } =
    useAppContext();

  const handleFilterWithMultipleCriteria = useCallback(() => {
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
  }, [searchedText, searchedSets, searchedType, flashcards]);

  const handleSearchedTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value);
  };

  const handleSetsChange = (sets: Array<string>) => {
    setSearchedSets(sets);
  };

  const handleTypesChange = (types: Array<FlashcardType>) => {
    setSearchedType(types);
  };

  const handleSelectAll = () => {
    setSelected(flashcards);
  };

  useEffect(() => {
    handleFilterWithMultipleCriteria();
  }, [searchedText, searchedSets, searchedType, flashcards]);

  return (
    <div className='flex w-full flex-col flex-wrap items-center justify-center gap-2 text-sm sm:flex-row sm:justify-end'>
      <span className='flex w-full justify-center sm:w-auto'>
        <Input
          inputType='checkbox'
          valid={true}
          for='selectAll'
          inputLabel='Select All'
          onChange={handleSelectAll}
          className='!w-full !max-w-80 sm:!w-56'
        />
      </span>

      <span className='flex w-full justify-center sm:w-auto'>
        <Input
          inputType='text'
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
          disabled={setsDictionary.length === 0}
        />

        <Dropdown
          config={flashcardTypeDictionaries}
          onChange={handleTypesChange}
          multipleLabel='Types'
          label='All Types'
          labelClassName='!w-full !max-w-80 sm:!w-56'
          multiple
          clearAll
        />
      </span>
    </div>
  );
}
