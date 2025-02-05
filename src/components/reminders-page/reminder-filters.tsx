'use client';
import { Search } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import Input from '../_ui/input/input';

export function ReminderFilters() {
  const [searchedText, setSearchedText] = useState('');

  const handleSearchedTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value);
  };

  return (
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
        {/* <Dropdown
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
        /> */}
      </span>
    </div>
  );
}
