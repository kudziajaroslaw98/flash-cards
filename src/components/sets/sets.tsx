'use client';

import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import Badge from '#/components/_ui/badge/badge';
import { Button } from '#/components/_ui/button/button';
import Card from '#/components/_ui/card/card';
import Dropdown from '#/components/_ui/dropdown/dropdown';
import Input from '#/components/_ui/input/input';
import ToggleButton from '#/components/_ui/toggle-button/toggle-button';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { NewSetModal } from '#/components/new-set-modal/new-set-modal';
import useLongPress from '#/hooks/use-long-press.hook';
import { useAppContext } from '#/providers/app-context';
import { cn } from '#/shared/utils/cn.util';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import { BadgeCheck, Pencil, Plus, Search, Star, Trash } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Sets() {
  const router = useRouter();
  const [isFavourite, toggleFavourite] = useState(false);
  const [searchedText, setSearchedText] = useState('');
  const [searchedCategory, setSearchedCategory] = useState<string[]>([]);
  const { sets, categories, addSets, removeSets, updateSets, updateSet } =
    useAppContext();

  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [selected, setSelected] = useState<FlashcardSet[]>([]);
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleNewSets = (sets: Partial<FlashcardSet>[]) => {
    window.umami.track('add_sets', { count: sets.length });
    addSets(sets);
  };

  const handleEditSets = (sets: Partial<FlashcardSet>[]) => {
    window.umami.track('edit_sets', { count: sets.length });
    updateSets(sets);
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

  const handleSetToggleChange = (set: FlashcardSet) => {
    window.umami.track('Toggle set favourite');
    updateSet({ ...set, isFavourite: !set.isFavourite });
  };

  const toggleSelected = (set: FlashcardSet) => {
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
    removeSets(selected);
    setSelected([]);
  };

  const [onStart, onEnd, onMove] = useLongPress<FlashcardSet, FlashcardSet>(
    (set) => {
      window.umami.track('Set long pressed');
      toggleSelected(set);
    },
    (set, e) => {
      if (isInSelectionMode) {
        window.umami.track('Set short pressed - toggle selected');
        toggleSelected(set.at(0) as FlashcardSet);
      } else {
        window.umami.track('Set short pressed - open set');
        const target = e.target as HTMLElement;

        if (target?.classList?.contains('toggle-button')) {
          handleSetToggleChange(set.at(0) as FlashcardSet);
        } else {
          router.push(`/flashcards/sets/${set.at(0)?.hardlink}`);
        }
      }
    },
  );

  return (
    <>
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
              icon={<Search className='h-4 w-4' />}
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
              animated={false}
              toggled={isFavourite}
              toggle={() => toggleFavourite(!isFavourite)}
              activeIcon={<Star className='h-4 w-4 fill-current' />}
              inactiveIcon={<Star className='h-4 w-4' />}
              size={'icon'}
              alt='Toggle favourite'
            />
          </span>
        </div>
      </div>

      <div className='flex w-full flex-col items-center justify-center gap-4'>
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
                  tabIndex={0}
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
                    <BadgeCheck className='absolute -right-4 -top-4 h-6 w-6  fill-green-500 text-gray-50 dark:text-slate-950' />
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
                      <Badge>{`${set.flashcards.length} cards`}</Badge>
                    </div>

                    <ToggleButton
                      animated={false}
                      ref={toggleRef}
                      toggled={set.isFavourite}
                      activeIcon={<Star className='h-4 w-4 fill-current' />}
                      inactiveIcon={<Star className='h-4 w-4' />}
                      size={'icon-sm'}
                      toggleVariant='text'
                      className='toggle-button z-30'
                      alt='Toggle favourite'
                    />
                  </div>
                </Card>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        <FloatingButtons>
          <NewSetModal
            trigger={
              <Button
                onClick={() => {
                  window.umami.track('Add set clicked');
                }}
                icon={<Plus className='h-4 w-4' />}
                size={'icon-square'}
                alt='Add new set'
              />
            }
            handleNew={handleNewSets}
            handleEdit={handleEditSets}
            selectedSets={[]}
            isInEditMode={false}
            categories={categories}
          />

          <NewSetModal
            trigger={
              <Button
                onClick={() => {
                  window.umami.track('Edit set clicked');
                }}
                icon={<Pencil className='h-4 w-4' />}
                size={'icon-square'}
                disabled={selected.length === 0}
                variant={'secondary'}
                alt='Edit set'
              />
            }
            handleNew={handleNewSets}
            handleEdit={handleEditSets}
            selectedSets={selected}
            isInEditMode={true}
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
                icon={<Trash className='h-4 w-4' />}
                size={'icon-square'}
                alt='Remove set'
              />
            }
            onAccept={removeSelected}
          />
        </FloatingButtons>
      </div>
    </>
  );
}
