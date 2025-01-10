'use client';
import Badge from '#/components/_ui/badge/badge';
import { Button } from '#/components/_ui/button/button';
import ContextMenu, {
  ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import LinkComponent from '#/components/_ui/link/link';
import { AssignFlashCardsModal } from '#/components/assign-flash-cards-modal/assign-flash-cards-modal';
import FlashCardComponent from '#/components/flash-card/flash-card';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { NewFlashCardModal } from '#/components/new-flash-card-modal/new-flash-card-modal';
import { NewSetModal } from '#/components/new-set-modal/new-set-modal';
import useFetch from '#/hooks/use-fetch.hook';
import { useAppContext } from '#/providers/app-context';
import { useSessionContext } from '#/providers/session-provider.component';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import type { ApiResponse } from '#/types/api-response.type';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import type { FlashCard } from '#/types/flash-card.type';
import {
  ArrowLeft,
  CopyCheck,
  Download,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Trash,
  Upload,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function SetHardlinkPage() {
  const setHardLink = useParams()?.hardlink as string;
  const router = useRouter();
  const { fetch, isLoading } = useFetch();
  const { isLoggedIn, isPlanActive } = useSessionContext();
  const {
    flashcards,
    addFlashCards,
    assignFlashCardsToSet,
    sets,
    categories,
    updateSet,
    removeSets,
    metadata,
    updateMetadata,
  } = useAppContext();

  const [set, setSet] = useState<FlashCardSet>(
    sets.filter((set) => set?.hardlink === setHardLink)[0],
  );
  const [capitalizedName] = useState<string>(
    setHardLink.replace(/-/g, ' ').charAt(0)?.toUpperCase() +
      setHardLink.replace(/-/g, ' ').slice(1),
  );
  const [accuracy] = useState<number>(0);

  useEffect(() => {
    setSet(sets.filter((set) => set?.hardlink === setHardLink)[0]);
  }, [sets, setHardLink]);

  const setFlashCards = useMemo(
    () =>
      flashcards.filter((flashcard) =>
        set?.flashCards?.includes(flashcard.frontUuid),
      ),
    [flashcards, set],
  );

  const handleAssignCards = (flashCards: string[]) => {
    window.umami.track('Flash card assigned to set');
    setSet((prev) => ({
      ...prev,
      flashCards: [...prev.flashCards, ...flashCards],
    }));
    updateSet({
      ...set,
      flashCards: flashCards,
    });
    assignFlashCardsToSet(flashCards, set.frontUuid);
  };

  const handleEditSet = (set: Partial<FlashCardSet>[]) => {
    window.umami.track('Edit set', { count: set.length });
    if (set.length > 0) {
      const hardlink = set[0].name?.replace(/ /g, '-').toLowerCase();
      router.prefetch(`flashcards/sets/${hardlink}`);

      updateSet(set[0]);
      setSet(set[0] as FlashCardSet);

      router.push(`${hardlink}`);
    }
  };

  const handleRemoveSet = () => {
    window.umami.track('Delete set');
    if (set?.frontUuid) {
      removeSets([set]);
      router.push('/flashcards/sets');
    }
  };

  const contextMenuActions: ContextMenuItem[] = [
    {
      type: 'item',
      label: 'Delete set',
      icon: <Trash className='h-6 w-6' />,
      onClick: handleRemoveSet,
    },
    {
      type: 'item',
      label: 'export set CSV',
      icon: <Download className='h-6 w-6' />,
      onClick: () => {
        window.umami.track('Export set CSV');
      },
    },
    {
      type: 'item',
      label: 'Import set CSV',
      icon: <Upload className='h-6 w-6' />,
      onClick: () => {
        window.umami.track('Import set CSV');
      },
    },
  ];

  const handleGenerateFlashCards = async () => {
    window.umami.track('Generate flash cards');
    if (!isLoggedIn || !isPlanActive) return;

    const response:
      | ApiResponse<unknown>
      | Record<'word' | 'definition', string>[] = await fetch(
      API_ROUTES.SET_FLASHCARDS,
      {
        method: 'POST',
        body: JSON.stringify({
          flashCards:
            setFlashCards.map((flashCard) => flashCard.questionAddition) ?? [],
          setName: set?.name ?? '',
        }),
      },
    );

    if ('success' in response && !response?.success) {
      console.warn(response?.error);
      return;
    }

    const flashCardsResponse: Record<'word' | 'definition', string>[] =
      response as Record<'word' | 'definition', string>[];

    const mappedFlashCards = flashCardsResponse.map(
      (flashCard, index) =>
        ({
          type: 'single',
          question: 'What is the definition of word below?',
          questionAddition: flashCard.word,
          answer: flashCard.definition,
          frontUuid: uuid(),
          order: flashcards.length + index,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          spacedRepetition: {
            interval: 1 * 24 * 60,
            easeFactor: 1.3,
            lastReviewAt: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            reviews: 0,
          },
        }) as const,
    );

    if (flashCardsResponse.length > 0) {
      addFlashCards(mappedFlashCards);
      updateSet({
        ...set,
        flashCards: [
          ...set.flashCards,
          ...mappedFlashCards.map((f) => f.frontUuid),
        ],
      });
    }
  };

  const handleNewFlashCards = (newFlashCards: Omit<FlashCard, 'order'>[]) => {
    window.umami.track('Add flash cards');

    if (newFlashCards.length > 0) {
      window.umami.track('Add flash cards', { count: newFlashCards.length });
      addFlashCards(newFlashCards);

      updateMetadata({
        ...metadata,
        createdFlashCards: metadata.createdFlashCards + newFlashCards.length,
      });

      updateSet({
        ...set,
        flashCards: [
          ...set.flashCards,
          ...newFlashCards.map((f) => f.frontUuid),
        ],
      });

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
              <ArrowLeft className='h-4 w-4 transition group-hover:translate-x-2 group-active:translate-x-1' />
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
                  icon={<Settings className='h-4 w-4' />}
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
            'grid-cols-[repeat(auto-fit,11rem)]',
          ])}
        >
          {setFlashCards.map((flashCard) => (
            <div key={`flashcard-${flashCard.frontUuid}`}>
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
                icon={<Plus className='size-4' />}
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
                icon={<CopyCheck className='size-4' />}
                size={'icon-square'}
                variant={'primary'}
              />
            }
            handleSubmit={handleAssignCards}
            flashCards={flashcards}
            setCards={setFlashCards.map((f) => f.frontUuid) ?? []}
          />

          <NewSetModal
            handleEdit={handleEditSet}
            selectedSets={set?.frontUuid ? [set] : []}
            isInEditMode={true}
            categories={categories}
            trigger={
              <Button
                icon={<Pencil className='size-4' />}
                size={'icon-square'}
                variant={'secondary'}
              />
            }
          />

          <Button
            disabled={!isLoggedIn || !isPlanActive}
            icon={<Sparkles className='size-4' />}
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
