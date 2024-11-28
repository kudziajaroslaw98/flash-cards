'use client';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  Cog8ToothIcon,
  DocumentCheckIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { AssignFlashCardsModal } from '#/components/assign-flash-cards-modal/assign-flash-cards-modal';
import { NewFlashCardModal } from '#/components/new-flash-card-modal/new-flash-card-modal';
import ContextMenu, {
  ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { useSessionContext } from '#/providers/session-provider.component';
import { useAppDispatch, useAppSelector } from '#/hooks/store-hooks.hook';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { DictionaryValue } from '#/types//dictionary-value.type';
import { removeSets, updateSet } from '#/store/reducers/sets.reducer';
import FlashCardComponent from '#/components/flash-card/flash-card';
import { statsSelectors } from '#/store/selectors/stats.selectors';
import type { FlashCard } from '#/shared/models/flash-card.model';
import { updateStatistics } from '#/store/reducers/stats.reducer';
import { setsSelectors } from '#/store/selectors/sets.selectors';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { Button } from '#/components/_ui/button/button';
import { useAppContext } from '#/providers/app-context';
import LinkComponent from '#/components/_ui/link/link';
import { useParams, useRouter } from 'next/navigation';
import useFetch from '#/hooks/use-fetch.hook';
import uuid from '#/shared/utils/uuid.util';
import { cn } from '#/shared/utils/cn.util';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const NewSetModal = dynamic(() =>
  import('#/components/new-set-modal/new-set-modal').then((x) => x.NewSetModal),
);

const Badge = dynamic(() => import('#/components/_ui/badge/badge'));

// eslint-disable-next-line @next/next/no-async-client-component
export default function SetHardlinkPage() {
  const setHardLink = useParams()?.hardlink as string;
  const router = useRouter();
  const { fetch, isLoading } = useFetch();
  const { isLoggedIn } = useSessionContext();
  const { flashcards, addFlashCards } = useAppContext();

  const sets = useAppSelector(setsSelectors.selectSetsArray);
  const statistics = useAppSelector(statsSelectors.selectStats);
  const categories: DictionaryValue<string>[] = useAppSelector(
    setsSelectors.selectCategoriesAsDictionary,
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

  const handleAssignCards = (flashCards: FlashCard[]) => {
    window.umami.track('Flash card assigned to set');
    setSet((prev) => ({
      ...prev,
      flashCards,
    }));
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
    if (!isLoggedIn) return;

    const setFlashCards = flashcards.filter((flashCard) =>
      set?.flashCards?.includes(flashCard),
    );

    const flashCardsResponse: Record<'word' | 'definition', string>[] =
      await fetch(API_ROUTES.SET_FLASHCARDS, {
        method: 'POST',
        body: JSON.stringify({
          flashCards: setFlashCards ?? [],
          setName: set?.name ?? '',
        }),
      });

    const mappedFlashCards = flashCardsResponse.map((flashCard, index) => ({
      question: 'What is the definition of word below?',
      questionAddition: flashCard.word,
      answer: flashCard.definition,
      frontUuid: uuid(),
      weight: 1.0,
      order: flashcards.length + index + 1,
    }));

    if (flashCardsResponse.length > 0) {
      addFlashCards(mappedFlashCards);
      dispatch(
        updateSet({
          ...set,
          flashCards: [...set.flashCards, ...mappedFlashCards],
        }),
      );
    }
  };

  const handleNewFlashCards = (
    newFlashCards: Omit<FlashCard, 'weight' | 'order'>[],
  ) => {
    window.umami.track('Add flash cards');

    if (newFlashCards.length > 0) {
      const flashcardUuids = newFlashCards.map((flashcard, index) => ({
        ...flashcard,
        weight: 1.0,
        order: flashcards.length + index + 1,
      }));

      window.umami.track('Add flash cards', { count: newFlashCards.length });
      addFlashCards(newFlashCards);

      dispatch(
        updateStatistics({
          updatedValue: statistics.createdFlashCards + newFlashCards.length,
          property: 'createdFlashCards',
        }),
      );

      dispatch(
        updateSet({
          ...set,
          flashCards: [...set.flashCards, ...flashcardUuids],
        }),
      );

      setTimeout(() => {
        window.document.body.scrollIntoView({
          block: 'end',
          behavior: 'smooth',
        });
      }, 1);
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
          'flex w-full flex-col justify-center gap-4 md:justify-start',
        ])}
      >
        <div
          className={cn([
            'grid w-full justify-center gap-4 md:justify-start',
            // 'm-[0 auto] inline-flex w-full flex-wrap gap-4',
            'grid-cols-[repeat(auto-fit,11rem)]',
          ])}
        >
          {set?.flashCards &&
            set?.flashCards.map((flashCard) => (
              <div key={flashCard.frontUuid}>
                <FlashCardComponent
                  flashCard={flashCard}
                  size={'sm'}
                />
              </div>
            ))}
        </div>

        <FloatingButtons>
          <NewFlashCardModal
            trigger={
              <Button
                icon={<PlusIcon className='size-4' />}
                size={'icon-square'}
                variant={'primary'}
              />
            }
            handleNewFlashCard={handleNewFlashCards}
            selectedFlashCards={[]}
            handleEditFlashCard={() => {}}
          />

          <AssignFlashCardsModal
            trigger={
              <Button
                icon={<DocumentCheckIcon className='size-4' />}
                size={'icon-square'}
                variant={'primary'}
              />
            }
            handleSubmit={handleAssignCards}
            flashCards={flashcards}
            setCards={set?.flashCards ?? []}
          />

          <NewSetModal
            handleEdit={handleEditSet}
            selectedSets={set?.frontUuid ? [set] : []}
            isInEditMode={true}
            categories={categories}
            trigger={
              <Button
                icon={<PencilIcon className='size-4' />}
                size={'icon-square'}
                variant={'secondary'}
              />
            }
          />

          <Button
            disabled={!isLoggedIn}
            icon={<SparklesIcon className='size-4' />}
            size={'icon-square'}
            variant={'secondary-outline'}
            onClick={handleGenerateFlashCards}
            loading={isLoading}
          />
        </FloatingButtons>
      </div>
    </div>
  );
}
