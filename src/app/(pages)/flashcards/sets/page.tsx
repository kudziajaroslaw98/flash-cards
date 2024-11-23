'use client';

import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import {
  addNewSets,
  removeSets,
  updateSet,
  updateSets,
} from '#/store/reducers/sets.reducer';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import ToggleButton from '#/components/_ui/toggle-button/toggle-button';
import type { DictionaryValue } from '#/types//dictionary-value.type';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import Dropdown from '#/components/_ui/dropdown/dropdown';
import { Button } from '#/components/_ui/button/button';
import useLongPress from '#/hooks/use-long-press.hook';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import Input from '#/components/_ui/input/input';
import Card from '#/components/_ui/card/card';
import { cn } from '#/shared/utils/cn.util';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const NewSetModal = dynamic(() =>
  import('#/components/new-set-modal/new-set-modal').then((x) => x.NewSetModal),
);

const Badge = dynamic(() => import('#/components/_ui/badge/badge'));

// TODO: add metadata and move content of the page to correct client component
// export const metadata: Metadata = {
//   authors: [
//     { name: 'Final Phase', url: 'https://finalphase.app' },
//     { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
//   ],
//   creator: 'Jarosław Kudzia',
//   title: 'Flash Card Sets - Organize Your Learning',
//   description:
//     'Create, manage, and study your flash card sets. Organize your learning materials efficiently.',
//   keywords: [
//     'flash card sets',
//     'study sets',
//     'flashcard collections',
//     'learning materials',
//     'vocabulary sets',
//     'organize flashcards',
//   ],
// };

export default function SetsPage() {
  const router = useRouter();
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

  const toggleRef = useRef<HTMLButtonElement>(null);

  const dispatch = useAppDispatch();

  const handleNewSets = (sets: Partial<FlashCardSet>[]) => {
    window.umami.track('add_sets', { count: sets.length });
    dispatch(addNewSets(sets));
  };

  const handleEditSets = (sets: Partial<FlashCardSet>[]) => {
    window.umami.track('edit_sets', { count: sets.length });
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
    window.umami.track('Search sets');
    setSearchedText(event.target.value);
  };

  const handleSearchCategoryChange = (category: string[]) => {
    window.umami.track('Search sets by category');
    setSearchedCategory(category);
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
    window.umami.track('Toggle set favourite');
    dispatch(updateSet({ ...set, isFavourite: !set.isFavourite }));
  };

  const toggleSelected = (set: FlashCardSet) => {
    window.umami.track('Set toggle selected');
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
    window.umami.track('Remove sets', { count: selected.length });
    dispatch(removeSets(selected.map((item) => item.frontUuid)));
    setSelected([]);
  };

  const [onStart, onEnd, onMove] = useLongPress<FlashCardSet, FlashCardSet>(
    (set) => {
      window.umami.track('Set long pressed');
      toggleSelected(set);
    },
    (set, e) => {
      if (isInSelectionMode) {
        window.umami.track('Set short pressed - toggle selected');
        toggleSelected(set.at(0) as FlashCardSet);
      } else {
        window.umami.track('Set short pressed - open set');

        if (toggleRef.current?.contains(e.target as Node)) {
          handleSetToggleChange(set.at(0) as FlashCardSet);
        } else {
          router.push(`/flashcards/sets/${set.at(0)?.hardlink}`);
        }
      }
    },
  );

  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-24'>
      <div className='flex w-full flex-col justify-between gap-4 '>
        <h4 className='w-52 text-green-400'>Your Decks</h4>

        <div className='flex w-full flex-col flex-wrap items-center justify-center gap-2 text-sm sm:flex-row sm:justify-end'>
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
              onChange={handleSearchCategoryChange}
              multiple
              multipleLabel='Categories'
              label='Category'
              clearAll
              searchable
              labelClassName='!w-full !max-w-80 sm:!w-56'
            />

            <ToggleButton
              toggled={isFavourite}
              toggle={() => {
                window.umami.track('Toggle favourite');
                toggleFavourite(!isFavourite);
              }}
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
              <Card
                key={set.frontUuid}
                className={cn([
                  'flex h-full cursor-pointer flex-col justify-between gap-4 sm:min-h-44 sm:gap-4',
                  selected.includes(set) ? 'ring ring-green-400/60' : '',
                ])}
                onMouseDown={(e) => onStart(e, set)}
                onTouchStart={(e) => onStart(e, set)}
                onMouseUp={(e) => onEnd(e, [set])}
                onTouchEnd={(e) => onEnd(e, [set])}
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
                    ref={toggleRef}
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
                window.umami.track('Add set clicked');
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
        />

        <NewSetModal
          trigger={
            <Button
              onClick={() => {
                window.umami.track('Edit set clicked');
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
        />

        <AlertDialog
          onCancel={() => {
            window.umami.track('Cancel remove set');
          }}
          headerText='Are you absolutely sure?'
          bodyText='This action cannot be undone. This will permanently delete your set.'
          trigger={
            <Button
              disabled={selected.length === 0}
              variant={'destructive'}
              icon={<TrashIcon className='h-4 w-4' />}
              size={'icon'}
            />
          }
          onAccept={removeSelected}
        />
      </m.div>
    </div>
  );
}
