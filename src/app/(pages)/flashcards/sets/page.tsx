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
import { DictionaryValue } from '#/shared/types/dictionary-value.type';
import uuid from '#/shared/utils/uuid.util';
import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { addNewSet, updateSet } from '#/store/reducers/sets.reducer';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SetsPage() {
  const [isFavourite, toggleFavourite] = useState(false);
  const [searchedText, setSearchedText] = useState('');
  const [searchedCategory, setSearchedCategory] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const [filteredSets, setFilteredSets] = useState<FlashCardSet[]>([]);
  const categories: DictionaryValue<string>[] = useAppSelector(
    setsSelectors.selectCategoriesAsDictionary,
  );
  const dispatch = useAppDispatch();

  const handleNewSet = (
    set: Record<keyof typeof newSetFormScheme.arguments.inputs, string>,
  ) => {
    const newUuid = uuid();
    let categories;

    if (set.category) {
      categories = Array.isArray(set.category) ? set.category : [set.category];
    }

    const newSet = {
      ...set,
      name: set.name,
      description: set.description,
      frontUuid: newUuid,
      isFavourite: false,
      flashCards: [],
      categories,
    };
    dispatch(addNewSet(newSet));
  };

  const handleFilterWithMultipleCryteria = () => {
    const tmpSets = sets
      .filter((set) => {
        if (searchedText !== '') {
          return set.name.toLowerCase().includes(searchedText.toLowerCase());
        }
        return true;
      })
      .filter((set) => {
        if (searchedCategory.length > 0) {
          return searchedCategory.includes(set.category ?? '');
        }
        return true;
      })
      .filter((set) => {
        if (isFavourite) {
          return set.isFavourite;
        }
        return true;
      });

    setFilteredSets(tmpSets);
  };

  const handleSearchedTextChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchedText(event.target.value);
  };

  const handleSetToggleChange = (set: FlashCardSet) => {
    dispatch(updateSet({ ...set, isFavourite: !set.isFavourite }));
  };

  useEffect(() => {
    handleFilterWithMultipleCryteria();
  }, [searchedText, searchedCategory, isFavourite, sets]);

  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-24'>
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
            onChange={handleSearchedTextChange}
          />

          <Dropdown
            config={categories}
            onChange={setSearchedCategory}
            multiple
            multipleLabel='Categories'
            label='Category'
            clearAll
            searchable
            labelClassName='!w-52'
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

      <div className='mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4 2xl:grid-cols-[repeat(3,minmax(20rem,1fr))]'>
        <AnimatePresence mode='popLayout'>
          {filteredSets.map((set) => (
            <motion.div
              key={set.frontUuid}
              exit={{
                y: '-5%',
                height: 0,
                marginTop: 0,
                opacity: 0,
              }}
            >
              <Card
                key={set.frontUuid}
                className='flex h-full flex-col justify-between gap-4 sm:min-h-44 sm:gap-4'
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
                    toggled={set.isFavourite}
                    toggle={() => {
                      handleSetToggleChange(set);
                    }}
                    activeIcon={<StarIcon className='h-4 w-4' />}
                    inactiveIcon={<StarIconOutline className='h-4 w-4' />}
                    size={'icon-sm'}
                    toggleVariant='text'
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
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
          categories={categories}
        />
      </div>
    </div>
  );
}
