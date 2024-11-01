'use client';

import { Button } from '#/components/ui/button/button.component';
import Card from '#/components/ui/card/card.component';
import Dropdown from '#/components/ui/dropdown/dropdown.component';
import Input from '#/components/ui/input/input.component';
import { ToggleButton } from '#/components/ui/toggle-button/toggle-button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useLongPress from '#/hooks/use-long-press.hook';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { DictionaryValue } from '#/shared/types/dictionary-value.type';
import { cn } from '#/shared/utils/cn.util';
import {
  addNewSets,
  removeSets,
  updateSet,
  updateSets,
} from '#/store/reducers/sets.reducer';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence, m } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NewSetModal = dynamic(() =>
  import('#/components/new-set-modal/new-set-modal.component').then(
    (x) => x.NewSetModal,
  ),
);

const Badge = dynamic(() => import('#/components/ui/badge/badge.component'));

export default function SetsPage() {
  const [isFavourite, toggleFavourite] = useState(false);
  const [searchedText, setSearchedText] = useState('');
  const [searchedCategory, setSearchedCategory] = useState<string[]>([]);
  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const categories: DictionaryValue<string>[] = useAppSelector(
    setsSelectors.selectCategoriesAsDictionary,
  );

  const [filteredSets, setFilteredSets] = useState<FlashCardSet[]>([]);
  const [selected, setSelected] = useState<FlashCardSet[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleNewSets = (sets: Partial<FlashCardSet>[]) => {
    dispatch(addNewSets(sets));
  };

  const handleEditSets = (sets: Partial<FlashCardSet>[]) => {
    dispatch(updateSets(sets));
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

  useEffect(() => {
    handleFilterWithMultipleCryteria();
  }, [searchedText, searchedCategory, isFavourite, sets]);

  useEffect(() => {
    if (selected.length > 0) {
      setIsInSelectionMode(true);
    } else {
      setIsInSelectionMode(false);
    }
  }, [selected]);

  const handleSetToggleChange = (set: FlashCardSet) => {
    dispatch(updateSet({ ...set, isFavourite: !set.isFavourite }));
  };

  const toggleSelected = (set: FlashCardSet) => {
    const isFlashCardSelected =
      selected.findIndex((item) => item.frontUuid === set.frontUuid) !== -1;

    if (isFlashCardSelected) {
      setSelected((prev) =>
        prev.filter((item) => set.frontUuid !== item.frontUuid),
      );
    } else {
      setSelected((prev) => [...prev, set]);
    }
  };

  const removeSelected = () => {
    dispatch(removeSets(selected.map((item) => item.frontUuid)));
    setSelected([]);
  };

  const [onStart, onEnd, onMove] = useLongPress<FlashCardSet, FlashCardSet>(
    (set) => toggleSelected(set),
    (set) => {
      if (isInSelectionMode) {
        toggleSelected(set as FlashCardSet);
      } else {
        router.push(`/flashcards/sets/${set.hardlink}`);
      }
    },
  );

  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-24'>
      <div className='flex w-full flex-col justify-between gap-4 '>
        <h4 className='w-52 text-green-400'>Your Decks</h4>

        <div className='flex w-full flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:justify-end'>
          <span className='flex w-full justify-center sm:w-auto'>
            <Input
              type='text'
              value={searchedText}
              valid={true}
              placeholder='Search in decks...'
              for='search'
              icon={<MagnifyingGlassIcon className='h-4 w-4' />}
              className='!w-full !max-w-80 sm:!w-56'
              onChange={handleSearchedTextChange}
            />
          </span>

          <span className='flex w-full flex-col items-center justify-center gap-2 sm:w-auto sm:flex-row'>
            <Dropdown
              config={categories}
              onChange={setSearchedCategory}
              multiple
              multipleLabel='Categories'
              label='Category'
              clearAll
              searchable
              labelClassName='!w-full !max-w-80 sm:!w-56'
            />

            <ToggleButton
              toggled={isFavourite}
              toggle={() => toggleFavourite(!isFavourite)}
              activeIcon={<StarIcon className='h-4 w-4' />}
              inactiveIcon={<StarIconOutline className='h-4 w-4' />}
              size={'icon'}
            />
          </span>
        </div>
      </div>

      <div className='mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4 lg:grid-cols-[repeat(2,minmax(20rem,1fr))] 2xl:grid-cols-[repeat(3,minmax(20rem,1fr))]'>
        <AnimatePresence mode='popLayout'>
          {filteredSets.map((set) => (
            <m.div
              layout={'position'}
              key={set.frontUuid}
              initial={{ translateY: '10%', opacity: 0, zIndex: -20 }}
              animate={{
                opacity: 1,
                translateY: '0%',
                zIndex: 20,
              }}
              exit={{
                opacity: 0,
                zIndex: -20,
                translateY: '-10%',
              }}
            >
              <Link
                href={`/flashcards/sets/${set.hardlink}`}
                prefetch
              >
                <Card
                  key={set.frontUuid}
                  className={cn([
                    'flex h-full flex-col justify-between gap-4 sm:min-h-44 sm:gap-4 ',
                    selected.includes(set) ? 'ring ring-green-400/60' : '',
                  ])}
                  onMouseDown={() => onStart(set)}
                  onTouchStart={() => onStart(set)}
                  onMouseUp={(e) => onEnd(e, set)}
                  onTouchEnd={(e) => onEnd(e, set)}
                  onTouchMove={onMove}
                >
                  {selected.includes(set) && (
                    <CheckBadgeIcon className='absolute -right-4 -top-4 h-6 w-6 text-green-400' />
                  )}

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
              </Link>
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      <m.div
        layout
        className='mt-8 flex w-full flex-col items-center justify-center gap-4 md:flex-row'
      >
        <NewSetModal
          trigger={
            <Button
              onClick={() => {
                setIsInEditMode(false);
              }}
              icon={<PlusIcon className='h-4 w-4' />}
              size={'icon'}
            />
          }
          handleNew={handleNewSets}
          handleEdit={handleEditSets}
          selectedSets={[]}
          isInEditMode={isInEditMode}
          categories={categories}
          multiple={true}
        />

        <NewSetModal
          trigger={
            <Button
              onClick={() => {
                setIsInEditMode(true);
              }}
              icon={<PencilIcon className='h-4 w-4' />}
              size={'icon'}
              disabled={selected.length === 0}
              variant={'secondary'}
            />
          }
          handleNew={handleNewSets}
          handleEdit={handleEditSets}
          selectedSets={selected}
          isInEditMode={isInEditMode}
          categories={categories}
          multiple={true}
        />

        <Button
          disabled={selected.length === 0}
          onClick={removeSelected}
          variant={'destructive'}
          icon={<TrashIcon className='h-4 w-4' />}
          size={'icon'}
        />
      </m.div>
    </div>
  );
}
