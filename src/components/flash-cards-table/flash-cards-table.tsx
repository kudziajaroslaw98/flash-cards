'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import FlashCardsCounterComponent from '#/components/flash-cards-counter/flash-cards-counter.component';
import { Button } from '#/components/ui/button/button.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import { FlashCard } from '#/shared/models/flash-card.model';

import {
  addNewFlashCard,
  removeFlashCards,
} from '#/store/reducers/flashcards.reducer';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import FlashCardComponent from '../flash-card/flash-card.component';
import { NewFlashCardModal } from '../new-flash-card-modal/new-flash-card-modal.component';

export default function FlashCardsTable() {
  const statistics = useAppSelector(statsSelectors.selectStats);
  const flashCardsArray = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  ).sort((head, tail) => head.order - tail.order);
  const dispatch = useAppDispatch();

  const [selected, setSelected] = useState<FlashCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSelected = (flashCard: FlashCard) => {
    return (
      selected.findIndex((item) => item.frontUuid === flashCard.frontUuid) !==
      -1
    );
  };

  const toggleSelected = (flashCard: FlashCard) => {
    const isFlashCardSelected =
      selected.findIndex((item) => item.frontUuid === flashCard.frontUuid) !==
      -1;

    if (isFlashCardSelected) {
      setSelected((prev) =>
        prev.filter((item) => flashCard.frontUuid !== item.frontUuid),
      );
    } else {
      setSelected((prev) => [...prev, flashCard]);
    }
  };

  const removeSelected = () => {
    dispatch(removeFlashCards(selected.map((item) => item.frontUuid)));
    setSelected([]);
  };

  const addNewRecord = (
    flashCard: Pick<FlashCard, 'question' | 'questionAddition' | 'answer'>,
  ) => {
    dispatch(addNewFlashCard(flashCard));

    dispatch(
      updateStatistics({
        updatedValue: statistics.createdFlashCards + 1,
        property: 'createdFlashCards',
      }),
    );

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };

  // const wordChange = (flashCard: FlashCard, value: string) => {
  //   dispatch(
  //     updateFlashCard({ flashCard, updatedValue: value, property: 'word' }),
  //   );
  // };

  // const definitionChange = (flashCard: FlashCard, value: string) => {
  //   dispatch(
  //     updateFlashCard({
  //       flashCard,
  //       updatedValue: value,
  //       property: 'definition',
  //     }),
  //   );
  // };

  // const editSelectedRecords = () => {
  // selected.forEach((frontUuid) => {
  //   dispatch(
  //     updateFlashCard({
  //       flashCard: flashCardsArray.find(
  //         (flashCard) => flashCard.frontUuid === frontUuid,
  //       )!,
  //       updatedValue:
  //         flashCardsArray.find(
  //           (flashCard) => flashCard.frontUuid === frontUuid,
  //         )!.order + 1,
  //       property: 'order',
  //     }),
  //   );
  // });
  // };

  return (
    <div className='flex w-full flex-col gap-6 py-8'>
      <FlashCardsCounterComponent count={flashCardsArray.length} />

      {/* {flashCardsArray.length > 0 && (
        <table className='flex h-auto w-full flex-col gap-1'>
          <thead>
            <tr className='flex w-full text-sm text-gray-500 dark:text-slate-300'>
              <th className='min-w-12 pl-2 text-left'>Id</th>

              <th className='flex min-w-44 flex-col pl-2 text-left md:flex-row'>
                <span className=''>Word</span>
                <span className='flex md:hidden'>Definition</span>
              </th>

              <th className='hidden w-full pl-2 text-left md:flex'>
                Definition
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {flashCardsArray.map((flashCard, index) => (
                <EditableFlashCardRowComponent
                  key={flashCard.frontUuid}
                  flashCard={flashCard}
                  index={index}
                  isSelected={isSelected}
                  toggleSelected={toggleSelected}
                ></EditableFlashCardRowComponent>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )} */}

      {flashCardsArray.length > 0 && (
        <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4 2xl:grid-cols-[repeat(3,minmax(20rem,1fr))]'>
          <AnimatePresence mode='popLayout'>
            {flashCardsArray.map((flashCard) => (
              <div key={flashCard.frontUuid}>
                <FlashCardComponent
                  flashCard={flashCard}
                  size={'sm'}
                  isSelected={isSelected(flashCard)}
                  onSelect={() => toggleSelected(flashCard)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className='flex w-full flex-col items-center justify-center gap-4 md:flex-row'>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<PlusIcon className='h-4 w-4' />}
          size={'icon'}
        />

        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<PencilIcon className='h-4 w-4' />}
          size={'icon'}
          disabled={selected.length === 0}
          variant={'secondary'}
        />

        {flashCardsArray.length > 0 && (
          <Button
            disabled={selected.length === 0}
            onClick={removeSelected}
            variant={'destructive'}
            icon={<TrashIcon className='h-4 w-4' />}
            size={'icon'}
          />
        )}
      </div>

      <NewFlashCardModal
        isDialogOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleNewFlashCard={addNewRecord}
        selectedFlashCards={selected}
      />
    </div>
  );
}
