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
import {
  BadgeCheck,
  Cog,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
  VenetianMask,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Popover } from '../popover/popover';

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
    window?.umami?.track('add_sets', { count: sets.length });
    addSets(sets);
  };

  const handleEditSets = (sets: Partial<FlashcardSet>[]) => {
    window?.umami?.track('edit_sets', { count: sets.length });
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
    window?.umami?.track('Search sets');
    setSearchedText(event.target.value);
  };

  const handleSearchCategoryChange = (category: string[]) => {
    window?.umami?.track('Search sets by category');
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
    window?.umami?.track('Toggle set favourite');
    updateSet({ ...set, isFavourite: !set.isFavourite });
  };

  const toggleSelected = (set: FlashcardSet) => {
    window?.umami?.track('Set toggle selected');
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
    window?.umami?.track('Remove sets', { count: selected.length });
    removeSets(selected);
    setSelected([]);
  };

  const [onStart, onEnd, onMove] = useLongPress<FlashcardSet, FlashcardSet>(
    (set) => {
      window?.umami?.track('Set long pressed');
      toggleSelected(set);
    },
    (set, e) => {
      if (isInSelectionMode) {
        window?.umami?.track('Set short pressed - toggle selected');
        toggleSelected(set.at(0) as FlashcardSet);
      } else {
        window?.umami?.track('Set short pressed - open set');
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
    <div className='flex w-full flex-col gap-2'>
      <div className='flex w-full items-center justify-start gap-4 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-start justify-center sm:items-start md:justify-between'>
          <h4 className='text-green-400'>Your Sets</h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{sets.length} sets created</span>
          </span>
        </div>

        <Popover
          trigger={
            <Button
              alt='filters button'
              icon={<Cog className='size-4' />}
              iconPosition='right'
              size={'icon-square-sm'}
              variant={'primary-outline'}
            />
          }
          position='bottom-right'
          popoverClassName='w-80 z-[40] p-4 flex flex-col gap-2'
        >
          <Input
            inputType='text'
            value={searchedText}
            valid={true}
            placeholder='Search in decks...'
            for='search'
            icon={<Search className='h-4 w-4' />}
            onChange={handleSearchedTextChange}
          />

          <Dropdown
            type='dropdown'
            config={categories}
            onChange={handleSearchCategoryChange}
            multiple
            multipleLabel='Categories'
            labelClassName='w-full'
            label='Category'
            contextPosition='bottom'
            clearAll
            searchable
            nestedPopover
          />

          <ToggleButton
            animated={false}
            toggled={isFavourite}
            toggle={() => toggleFavourite(!isFavourite)}
            activeIcon={<Star className='h-4 w-4 fill-current' />}
            inactiveIcon={<Star className='h-4 w-4' />}
            size={'full'}
            alt='Toggle favourite'
            label='Show only favourite'
            toggledLabel='Show all'
          />
        </Popover>
      </div>

      <div className='flex w-full flex-col items-center justify-center gap-4'>
        {filteredSets.length === 0 && (
          <div className='flex w-full flex-col items-center justify-center py-10'>
            <VenetianMask className='mb-8 size-12 text-green-500' />
            <span>Your sets are currently in stealth mode.</span>
            <span>Let&apos;s coax them into the spotlight!</span>
          </div>
        )}
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

                    <p className='text-sm text-gray-600 dark:text-slate-400'>
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
                  window?.umami?.track('Add set clicked');
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
                  window?.umami?.track('Edit set clicked');
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
              window?.umami?.track('Cancel remove set');
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
    </div>
  );
}
