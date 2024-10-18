'use client';
import { NewSetModal } from '#/components/new-set-modal/new-set-modal.component';
import Badge from '#/components/ui/badge/badge.component';
import { Button } from '#/components/ui/button/button.component';
import Card from '#/components/ui/card/card.component';
import Dropdown from '#/components/ui/dropdown/dropdown.component';
import Input from '#/components/ui/input/input.component';
import { ToggleButton } from '#/components/ui/toggle-button/toggle-button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCardSet } from '#/shared/models/flashcard-set.model';
import uuid from '#/shared/utils/uuid.util';
import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { addNewSet } from '#/store/reducers/sets.reducer';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function SetsPage() {
  const [isFavourite, toggleFavourite] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const dispatch = useAppDispatch();

  const Sets: FlashCardSet[] = [
    {
      frontUuid: '1',
      isFavourite: true,
      flashCards: [],
      name: 'Earth Science Essentials Part 1',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans.",
      category: 'Science',
    },
    {
      frontUuid: '2',
      isFavourite: false,
      flashCards: [],
      name: 'Wild Animals',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests",
      category: 'Biology',
    },
    {
      frontUuid: '3',
      isFavourite: false,
      flashCards: [],
      name: 'Greek Science',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans.",
    },
    {
      frontUuid: '4',
      isFavourite: false,
      flashCards: [],
      name: 'Biology Secrects',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans, our planet's forests, savannas, mountains, and oceans.",
      category: 'Science',
    },
  ];

  const handleNewSet = (
    set: Partial<Record<keyof typeof newSetFormScheme.inputs, string>>,
  ) => {
    const newUuid = uuid();
    const newSet = {
      ...set,
      name: set.name || 'New Set',
      description: set.description || 'No description',
      frontUuid: newUuid,
      isFavourite: false,
      flashCards: [],
      category: 'Science',
    };
    dispatch(addNewSet(newSet));
  };

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
            className='!max-w-56'
          />

          <Dropdown
            config={{
              learn: { label: 'Learn', value: 'learn' },
              revise: { label: 'Revise', value: 'revise' },
            }}
            onChange={() => {}}
            label='Category'
            multiple
            clearAll
            searchable
          />

          <ToggleButton
            toggled={isFavourite}
            toggle={() => toggleFavourite(!isFavourite)}
            activeIcon={<StarIcon className='h-4 w-4' />}
            inactiveIcon={<StarIconOutline className='h-4 w-4' />}
            size={'icon'}
          />
        </div>
      </div>

      <div className='mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4'>
        {sets.map((set) => (
          <Card
            key={set.frontUuid}
            className='flex flex-col justify-between gap-4 sm:min-h-44 sm:gap-4'
          >
            <div className='flex flex-col gap-4'>
              <h5 className='text-base font-bold text-gray-800 dark:text-slate-200'>
                {set.name}
              </h5>

              <p className='text-sm text-gray-500 dark:text-slate-500'>
                {set.description}
              </p>
            </div>

            <div className='flex w-full items-center justify-between'>
              <div className='flex w-full items-center gap-2'>
                {set.category && <Badge>{set.category}</Badge>}
                <Badge>{`${set.flashCards.length} cards`}</Badge>
              </div>

              <ToggleButton
                toggled={isFavourite}
                toggle={() => toggleFavourite(!isFavourite)}
                activeIcon={<StarIcon className='h-4 w-4' />}
                inactiveIcon={<StarIconOutline className='h-4 w-4' />}
                size={'icon-sm'}
                toggleVariant='text'
              />
            </div>
          </Card>
        ))}
      </div>

      <div className='mt-8 grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4'>
        <Button
          label='Create new set'
          onClick={() => setIsDialogOpen(true)}
        ></Button>

        <NewSetModal
          setIsModalOpen={setIsDialogOpen}
          isDialogOpen={isDialogOpen}
          handleNewSet={handleNewSet}
        />
      </div>
    </div>
  );
}
