'use client';
import FormComponent from '#/components/form-component/form.component';
import Badge from '#/components/ui/badge/badge.component';
import { Button } from '#/components/ui/button/button.component';
import Card from '#/components/ui/card/card.component';
import Dropdown from '#/components/ui/dropdown/dropdown.component';
import Input from '#/components/ui/input/input.component';
import Modal from '#/components/ui/modal/modal.component';
import { ToggleButton } from '#/components/ui/toggle-button/toggle-button.component';
import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { FlashCardSet } from '#/shared/models/flashcard-set.model';
import { signInValidationScheme } from '#/shared/validation-schemes/sign-in-validation.scheme';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';
import { useRef, useState } from 'react';

export default function SetsPage() {
  const [isFavourite, toggleFavourite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useRef(null);

  const Sets: FlashCardSet[] = [
    {
      frontUuid: '1',
      uuid: '1',
      isFavourite: true,
      flashCards: [],
      name: 'Earth Science Essentials Part 1',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans.",
      category: 'Science',
    },
    {
      frontUuid: '2',
      uuid: '2',
      isFavourite: false,
      flashCards: [],
      name: 'Wild Animals',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests",
      category: 'Biology',
    },
    {
      frontUuid: '3',
      uuid: '3',
      isFavourite: false,
      flashCards: [],
      name: 'Greek Science',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans.",
    },
    {
      frontUuid: '4',
      uuid: '4',
      isFavourite: false,
      flashCards: [],
      name: 'Biology Secrects',
      description:
        "Perfect for learning about the diverse species that inhabit our planet's forests, savannas, mountains, and oceans, our planet's forests, savannas, mountains, and oceans.",
      category: 'Science',
    },
  ];

  const handleDialogClose = () => {
    setIsModalOpen(false);
  };

  useOutsideAlerter(dialogRef, handleDialogClose);

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
            onChange={(value) => {
              console.log(value);
            }}
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

      <div className='mt-8 grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4'>
        {Sets.map((set) => (
          <Card
            key={set.uuid}
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
          onClick={() => setIsModalOpen(true)}
        ></Button>
        <Modal
          open={isModalOpen}
          onDialogClose={handleDialogClose}
          ref={dialogRef}
          className='w-[30rem]'
        >
          <Modal.Header>
            <h6>Create new set</h6>
          </Modal.Header>

          <Modal.Body>
            <FormComponent
              scheme={{
                inputs: {
                  email: {
                    type: 'email',
                    name: 'email',
                    label: 'Email',
                    placeholder: 'example@email.com',
                  },
                  password: {
                    type: 'password',
                    name: 'password',
                    label: 'Password',
                  },
                },
                validation: signInValidationScheme,
              }}
              emitFormValid={() => null}
              emitFormValue={() => null}
            />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
