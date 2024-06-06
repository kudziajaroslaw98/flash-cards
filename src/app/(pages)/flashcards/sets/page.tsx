'use client';
import Dropdown from '#/components/ui/dropdown/dropdown.component';
import Input from '#/components/ui/input/input.component';
import { ToggleButton } from '#/components/ui/toggle-button/toggle-button.component';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';

export default function SetsPage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center'>
      <div className='flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center'>
        <h4 className='w-52 text-green-400'>Your Decks</h4>

        <div className='flex w-full items-center justify-end gap-2'>
          <Input
            value=''
            valid={true}
            placeholder='Search in decks...'
            for='search'
            icon={<MagnifyingGlassIcon className='h-4 w-4' />}
            className='!max-w-80'
          />

          <Dropdown
            config={{
              learn: { label: 'Learn', value: 'learn' },
              revise: { label: 'Revise', value: 'revise' },
            }}
            onChange={(value) => {
              console.log(value);
            }}
            label='Category'
            multiple
            clearAll
            searchable
          />

          <Dropdown
            config={{
              learn: { label: 'Learn', value: 'learn' },
              revise: { label: 'Revise', value: 'revise' },
            }}
            onChange={(value) => {
              console.log(value);
            }}
            label='Category'
          />

          <ToggleButton
            toggle={() => {}}
            toggled={true}
            activeIcon={<StarIcon className='h-4 w-4' />}
            inactiveIcon={<StarIcon className='h-4 w-4' />}
            size={'icon'}
          />
        </div>
      </div>
    </div>
  );
}
