'use client';
import { AssignFlashCardsModal } from '#/components/assign-flash-cards-modal/assign-flash-cards-modal.component';
import FlashCardComponent from '#/components/flash-card/flash-card.component';
import Badge from '#/components/ui/badge/badge.component';
import { Button } from '#/components/ui/button/button.component';
import ContextMenu, {
  ContextMenuItem,
} from '#/components/ui/context-menu/context-menu.component';
import LinkComponent from '#/components/ui/link/link.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCardSet } from '#/shared/models/flash-card-set.model';
import { FlashCard } from '#/shared/models/flash-card.model';
import { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import { UUID } from '#/shared/types/uuid.type';
import { cn } from '#/shared/utils/cn.util';
import { updateSet } from '#/store/reducers/sets.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  Cog8ToothIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SetHardlinkPage() {
  const setHardLink = useParams()?.hardlink as string;

  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const flashCardsArray: FlashCard[] = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  );
  const flashCards: FlashCards = useAppSelector(
    flashCardSelectors.selectFlashCards,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [set, setSet] = useState<FlashCardSet>(
    sets.filter((set) => set.hardlink === setHardLink)[0],
  );
  const [capitalizedName] = useState<string>(
    setHardLink.replace(/-/g, ' ').charAt(0)?.toUpperCase() +
      setHardLink.replace(/-/g, ' ').slice(1),
  );
  const [accuracy] = useState<number>(0);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setSet(sets.filter((set) => set.hardlink === setHardLink)[0]);
  }, [sets, setHardLink]);

  const handleSubmit = (flashCards: UUID[]) => {
    setSet((prev) => ({ ...prev, flashCards }));
    dispatch(
      updateSet({
        ...set,
        flashCards,
      }),
    );
  };

  const contextMenuActions: ContextMenuItem[] = [
    {
      label: 'Edit set',
      icon: <PencilIcon className='h-6 w-6' />,
      onClick: () => null,
    },
    {
      label: 'Delete set',
      icon: <TrashIcon className='h-6 w-6' />,
      onClick: () => null,
    },
    {
      label: 'export set CSV',
      icon: <ArrowDownTrayIcon className='h-6 w-6' />,
      onClick: () => null,
    },
    {
      label: 'Import set CSV',
      icon: <ArrowUpTrayIcon className='h-6 w-6' />,
      onClick: () => null,
    },
  ];

  return (
    <div className='flex h-full w-full grow flex-col items-center gap-8 md:pb-24'>
      <div className='flex w-full flex-col justify-start gap-4'>
        <div className='flex w-full items-center justify-start gap-4'>
          <LinkComponent
            href='/flashcards/sets'
            icon={
              <ArrowLeftIcon className='h-4 w-4 transition group-hover:translate-x-2' />
            }
            label='Back'
            className='group w-auto pb-4 text-green-400'
            underline={false}
          />
        </div>

        <div className='flex justify-between'>
          <h4 className='line-clamp-2 flex w-full max-w-md items-center gap-4 text-green-400'>
            {capitalizedName}
          </h4>

          <div className='flex gap-4'>
            <ContextMenu
              contextPosition='bottom'
              triggerComponent={
                <Button
                  icon={<Cog8ToothIcon className='h-6 w-6' />}
                  size={'icon'}
                  variant={'primary-outline'}
                />
              }
              menuItems={contextMenuActions}
              name='set-options'
            />
          </div>
        </div>

        <span className='line-clamp-3 w-full max-w-md text-sm text-gray-500 dark:text-slate-400'>
          {set?.description}
        </span>

        <span className='flex w-full flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400'>
          {set?.category && (
            <>
              <span className='flex items-center'>
                <Badge>{set?.category}</Badge>
              </span>

              <span className='text-gray-200'>|</span>
            </>
          )}

          {/* <span>Created by:</span>
          <span className='text-gray-200'>|</span>
          <span>Created:{set?.createdAt}</span>
          <span className='text-gray-200'>|</span> */}
          <span>{set?.flashCards?.length} cards assigned</span>
          <span className='text-gray-200'>|</span>
          <span>{accuracy}% average accuracy</span>
        </span>
      </div>

      {set?.flashCards?.length === 0 && (
        <div className='text-gray-600 dark:text-slate-300'>
          <span>No assigned cards</span>
        </div>
      )}

      <div
        className={cn([
          'grid w-full justify-center gap-4 md:justify-start',
          // 'm-[0 auto] inline-flex w-full flex-wrap gap-4',
          'grid-cols-[repeat(auto-fit,11rem)]',
        ])}
      >
        <AnimatePresence mode='popLayout'>
          {set?.flashCards &&
            set?.flashCards.map((flashCard) => (
              <div key={flashCard}>
                <FlashCardComponent
                  flashCard={flashCards?.[flashCard]}
                  size={'sm'}
                />
              </div>
            ))}
        </AnimatePresence>
      </div>

      <div className='flex w-full flex-col items-center justify-center gap-4 md:flex-row'>
        <Button
          label='Assign Cards'
          size={'lg'}
          variant={'primary'}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </div>

      {/*<div className='mt-8 grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4'></div> */}
      <AssignFlashCardsModal
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        handleSubmit={handleSubmit}
        flashCards={flashCardsArray}
        setCards={set?.flashCards ?? []}
      />
    </div>
  );
}
