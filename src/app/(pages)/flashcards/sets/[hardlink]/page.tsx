'use client';
import { Button } from '#/components/_ui/button/button';
import ContextMenu, {
  ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import LinkComponent from '#/components/_ui/link/link';
import FlashCardComponent from '#/components/flash-card/flash-card';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import useFetch from '#/hooks/use-fetch.hook';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { FlashCard } from '#/shared/models/flash-card.model';
import type { DictionaryValue } from '#/shared/types/dictionary-value.type';
import type { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import type { UUID } from '#/shared/types/uuid.type';
import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import { addNewFlashCards } from '#/store/reducers/flashcards.reducer';
import { removeSets, updateSet } from '#/store/reducers/sets.reducer';
import { flashCardSelectors } from '#/store/selectors/flashcards.selectors';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  Cog8ToothIcon,
  PencilIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NewSetModal = dynamic(() =>
  import('#/components/new-set-modal/new-set-modal').then((x) => x.NewSetModal),
);

const AssignFlashCardsModal = dynamic(() =>
  import('#/components/assign-flash-cards-modal/assign-flash-cards-modal').then(
    (x) => x.AssignFlashCardsModal,
  ),
);

const Badge = dynamic(() => import('#/components/_ui/badge/badge'));

// eslint-disable-next-line @next/next/no-async-client-component
export default function SetHardlinkPage() {
  const setHardLink = useParams()?.hardlink as string;
  const router = useRouter();
  const { fetch, isLoading } = useFetch();

  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const categories: DictionaryValue<string>[] = useAppSelector(
    setsSelectors.selectCategoriesAsDictionary,
  );
  const flashCardsArray: FlashCard[] = useAppSelector(
    flashCardSelectors.selectFlashCardsArray,
  );
  const flashCards: FlashCards = useAppSelector(
    flashCardSelectors.selectFlashCards,
  );

  const [set, setSet] = useState<FlashCardSet>(
    sets.filter((set) => set?.hardlink === setHardLink)[0],
  );
  const [capitalizedName] = useState<string>(
    setHardLink.replace(/-/g, ' ').charAt(0)?.toUpperCase() +
      setHardLink.replace(/-/g, ' ').slice(1),
  );
  const [accuracy] = useState<number>(0);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setSet(sets.filter((set) => set?.hardlink === setHardLink)[0]);
  }, [sets, setHardLink]);

  const handleAssignCards = (flashCards: UUID[]) => {
    window.umami.track('Flash card assigned to set');
    setSet((prev) => ({ ...prev, flashCards }));
    dispatch(
      updateSet({
        ...set,
        flashCards,
      }),
    );
  };

  const handleEditSet = (set: Partial<FlashCardSet>[]) => {
    window.umami.track('Edit set', { count: set.length });
    if (set.length > 0) {
      const hardlink = set[0].name?.replace(/ /g, '-').toLowerCase();
      router.prefetch(`flashcards/sets/${hardlink}`);

      dispatch(updateSet(set[0]));
      setSet(set[0] as FlashCardSet);

      router.push(`${hardlink}`);
    }
  };

  const handleRemoveSet = () => {
    window.umami.track('Delete set');
    if (set?.frontUuid) {
      dispatch(removeSets([set?.frontUuid]));
      router.push('/flashcards/sets');
    }
  };

  const contextMenuActions: ContextMenuItem[] = [
    {
      label: 'Delete set',
      icon: <TrashIcon className='h-6 w-6' />,
      onClick: handleRemoveSet,
    },
    {
      label: 'export set CSV',
      icon: <ArrowDownTrayIcon className='h-6 w-6' />,
      onClick: () => {
        window.umami.track('Export set CSV');
      },
    },
    {
      label: 'Import set CSV',
      icon: <ArrowUpTrayIcon className='h-6 w-6' />,
      onClick: () => {
        window.umami.track('Import set CSV');
      },
    },
  ];

  const handleGenerateFlashCards = async () => {
    window.umami.track('Generate flash cards');
    const setFlashCards = flashCardsArray.filter((flashCard) =>
      set?.flashCards?.includes(flashCard.frontUuid),
    );

    const flashCardsResponse: Record<'word' | 'definition', string>[] =
      await fetch('/api/ai/set', {
        method: 'POST',
        body: JSON.stringify({
          flashCards: setFlashCards ?? [],
          setName: set?.name ?? '',
        }),
      });

    const mappedFlashCards = flashCardsResponse.map((flashCard) => ({
      question: 'What is the definition of word below?',
      questionAddition: flashCard.word,
      answer: flashCard.definition,
      frontUuid: uuid(),
    }));

    if (flashCardsResponse.length > 0) {
      dispatch(addNewFlashCards(mappedFlashCards));
      dispatch(
        updateSet({
          ...set,
          flashCards: [
            ...set.flashCards,
            ...mappedFlashCards.map((x) => x.frontUuid),
          ],
        }),
      );
    }
  };

  return (
    <div className='flex h-full w-full grow flex-col items-center gap-8 md:pb-24'>
      <div className='flex w-full flex-col justify-start gap-4'>
        <div className='flex w-full items-center justify-start gap-4'>
          <LinkComponent
            href='/flashcards/sets'
            icon={
              <ArrowLeftIcon className='h-4 w-4 transition group-hover:translate-x-2 group-active:translate-x-1' />
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
                  icon={<Cog8ToothIcon className='h-4 w-4' />}
                  size={'icon'}
                  variant={'primary-outline'}
                  onClick={() => window.umami.track('Set options clicked')}
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
        {set?.flashCards &&
          set?.flashCards.map((flashCard) => (
            <div key={flashCard}>
              <FlashCardComponent
                flashCard={flashCards?.[flashCard]}
                size={'sm'}
              />
            </div>
          ))}
      </div>

      <div className='flex w-full flex-col items-center justify-center gap-4 md:flex-row'>
        <AssignFlashCardsModal
          trigger={
            <Button
              label='Assign Cards'
              size={'lg'}
              variant={'primary'}
            />
          }
          handleSubmit={handleAssignCards}
          flashCards={flashCardsArray}
          setCards={set?.flashCards ?? []}
        />

        <NewSetModal
          handleEdit={handleEditSet}
          selectedSets={set?.frontUuid ? [set] : []}
          isInEditMode={true}
          categories={categories}
          trigger={
            <Button
              icon={<PencilIcon className='h-4 w-4' />}
              size={'icon'}
              variant={'secondary'}
            />
          }
        />

        <Button
          disabled={true}
          icon={<SparklesIcon className='h-4 w-4' />}
          size={'icon'}
          variant={'secondary-outline'}
          onClick={handleGenerateFlashCards}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
