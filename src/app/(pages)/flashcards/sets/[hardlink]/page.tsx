'use client';
import Badge from '#/components/_ui/badge/badge';
import { Button } from '#/components/_ui/button/button';
import ContextMenu, {
  ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import LinkComponent from '#/components/_ui/link/link';
import { AssignFlashcardsModal } from '#/components/assign-flash-cards-modal/assign-flash-cards-modal';
import FlashcardComponent from '#/components/flash-card/flash-card';
import { FloatingButtons } from '#/components/floating-buttons/floating-buttons';
import { NewFlashcardModal } from '#/components/new-flash-card-modal/new-flash-card-modal';
import { NewSetModal } from '#/components/new-set-modal/new-set-modal';
import { FlashcardGenerateDialog } from '#/components/sets-dialogs/flashcard-generate-dialog/flashcard-generate-dialog';
import { db } from '#/db/dexie.db';
import { useAppContext } from '#/providers/app-context';
import { useSessionContext } from '#/providers/session-provider.component';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import { FlashcardGenerationOptions } from '#/types/flashcard-generation-options.type';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ArrowLeft,
  Cookie,
  CopyCheck,
  CopyMinus,
  Download,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Trash,
  Upload,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

export default function SetHardlinkPage() {
  const setHardLink = useParams()?.hardlink as string;
  const router = useRouter();
  // const { fetch, isLoading } = useFetch();
  const { isLoggedIn, isPlanActive } = useSessionContext();
  const {
    flashcards,
    addFlashcards,
    assignFlashcardsToSet,
    unassignFlashcardsFromSet,
    sets,
    categories,
    updateSets,
    removeSets,
    metadata,
    updateMetadata,
  } = useAppContext();

  const [set, setSet] = useState<FlashcardSet>(
    sets.filter((set) => set?.hardlink === setHardLink)[0],
  );
  const [selected, setSelected] = useState<Flashcard[]>([]);
  const [generated, setGenerated] = useState<Flashcard[]>([]);

  const {
    submit: generateFlashcards,
    isLoading: isGeneratingFlashcards,
    object: generatedFlashcards,
  } = useObject({
    api: API_ROUTES.SET_FLASHCARDS,
    schema: z.array(
      z.object({
        id: z.string(),
        query: z.string(),
        topic: z.string(),
        definition: z.string(),
        tags: z.array(z.string()),
        examples: z.string(),
        keyPoints: z.string(),
        synonyms: z.string(),
        relatedFacts: z.string(),
      }),
    ),
  });

  const setFlashcards =
    useLiveQuery(
      () => db.flashcards.where('sets').anyOf([set?.frontUuid]).toArray(),
      [set?.frontUuid],
    ) ?? [];

  const handleAssignCards = (flashcards: string[]) => {
    window?.umami?.track('flashcard assigned to set');
    setSet((prev) => ({
      ...prev,
      flashcards,
    }));
    assignFlashcardsToSet(flashcards, set.frontUuid);
  };

  const handleEditSet = (set: Partial<FlashcardSet>[]) => {
    window?.umami?.track('Edit set', { count: set.length });
    if (set.length > 0) {
      const hardlink = set[0].name?.replace(/ /g, '-').toLowerCase();
      router.prefetch(`flashcards/sets/${hardlink}`);

      updateSets([set[0]]);
      setSet(set[0] as FlashcardSet);

      router.push(`${hardlink}`);
    }
  };

  const handleRemoveSet = () => {
    window?.umami?.track('Delete set');
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
        window?.umami?.track('Export set CSV');
      },
    },
    {
      type: 'item',
      label: 'Import set CSV',
      icon: <Upload className='h-6 w-6' />,
      onClick: () => {
        window?.umami?.track('Import set CSV');
      },
    },
  ];

  const handleGenerateFlashcards = async (
    options: Partial<FlashcardGenerationOptions>,
  ) => {
    window?.umami?.track('Generate flashcards');
    if (!isLoggedIn || !isPlanActive) return;

    updateSets([
      {
        ...set,
        generationOptions: options,
      },
    ]);

    generateFlashcards({
      flashcards: setFlashcards.map((flashcard) => flashcard.frontUuid) ?? [],
      setName: set?.name ?? '',
      setDescription: set?.description ?? '',
      options: options,
    });
  };

  const handleNewFlashcards = (newFlashcards: Omit<Flashcard, 'order'>[]) => {
    window?.umami?.track('Add flashcards');

    if (newFlashcards.length > 0) {
      window?.umami?.track('Add flashcards', { count: newFlashcards.length });
      addFlashcards(
        newFlashcards.map((f) => ({ ...f, sets: [set.frontUuid] })),
      );

      updateMetadata({
        ...metadata,
        createdFlashCards: metadata.createdFlashCards + newFlashcards.length,
      });

      updateSets([
        {
          ...set,
          flashcards: [
            ...set.flashcards,
            ...newFlashcards.map((f) => f.frontUuid),
          ],
        },
      ]);

      setTimeout(() => {
        window.document.body.scrollIntoView({
          block: 'end',
          behavior: 'smooth',
        });
      }, 1);
    }
  };

  const handleUnassignFlashcards = () => {
    window?.umami?.track('Unassign flashcards');

    unassignFlashcardsFromSet(
      selected.map((f) => f.frontUuid),
      set.frontUuid,
    );
    setSelected([]);
  };

  const isSelected = useCallback(
    (flashcard: Flashcard) => {
      return (
        selected.findIndex((item) => item.frontUuid === flashcard.frontUuid) !==
        -1
      );
    },
    [selected],
  );

  const toggleSelected = useCallback(
    (flashcard: Flashcard) => {
      if (isSelected(flashcard)) {
        setSelected((prev) =>
          prev.filter((item) => flashcard.frontUuid !== item.frontUuid),
        );
      } else {
        setSelected((prev) => [...prev, flashcard]);
      }
    },
    [isSelected],
  );

  useEffect(() => {
    setSet(sets.filter((set) => set?.hardlink === setHardLink)[0]);
  }, [sets, setHardLink]);

  useEffect(() => {
    if (!generatedFlashcards) return;
    setGenerated((prev) => {
      const length = prev.length;
      const validGeneratedFlashcards = generatedFlashcards?.filter(
        (flashcard) => flashcard,
      );

      const newFlashcards = validGeneratedFlashcards.slice(
        length,
        validGeneratedFlashcards.length,
      );
      const mappedFlashcards = newFlashcards?.map((flashcard, index) =>
        flashcardsMerge(defaultFlashcard(), {
          ...flashcard,
          frontUuid: uuid(),
          order: setFlashcards.length + newFlashcards.length + index,
          context: flashcard?.topic,
          type: 'single',
          tags: [...(flashcard?.tags as string[])],
          sets: [set.frontUuid],
        }),
      ) as Flashcard[];

      return [...prev, ...mappedFlashcards];
    });

    if (generatedFlashcards && !isGeneratingFlashcards) {
      if (generated.length > 0) {
        addFlashcards(generated);
        updateSets([
          {
            ...set,
            flashcards: [
              ...set.flashcards,
              ...generated.map((f) => f.frontUuid),
            ],
          },
        ]);
        setGenerated([]);
      }
    }
  }, [generatedFlashcards, isGeneratingFlashcards]);

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
            {set?.name}
          </h4>

          <div className='flex gap-4'>
            <ContextMenu
              contextPosition='bottom'
              triggerComponent={
                <Button
                  icon={<Settings className='h-4 w-4' />}
                  size={'icon'}
                  variant={'primary-outline'}
                  onClick={() => window?.umami?.track('Set options clicked')}
                  alt='Set options'
                />
              }
              menuItems={contextMenuActions}
              name='set-options'
            />
          </div>
        </div>

        <span className='line-clamp-4 w-full max-w-md text-sm text-gray-500 dark:text-slate-400'>
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

          <span>{set?.flashcards?.length} cards assigned</span>
        </span>
      </div>

      {setFlashcards.length === 0 && generated.length === 0 && (
        <div className='flex w-full flex-col items-center justify-center py-10 text-center'>
          <Cookie className='mb-8 size-12 text-green-500' />
          <span>
            This set is as empty as a cookie jar after a midnight snack.
          </span>
          <span>Let&apos;s fill it up!</span>
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
            'grid-cols-1 min-[600px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
          ])}
        >
          <AnimatePresence mode='popLayout'>
            {setFlashcards
              .sort((head, tail) => head.order - tail.order)
              .map((flashcard) => (
                <div key={`flashcard-${flashcard.frontUuid}`}>
                  <FlashcardComponent
                    flashcard={flashcard}
                    isSelected={isSelected(flashcard)}
                    onSelect={toggleSelected}
                    isInSelectionMode={selected.length > 0}
                    size={'horizontal-sm'}
                  />
                </div>
              ))}
            {generated
              .sort((head, tail) => head.order - tail.order)
              .map((flashcard) => (
                <div key={`flashcard-${flashcard.frontUuid}`}>
                  <FlashcardComponent
                    flashcard={flashcard}
                    isSelected={isSelected(flashcard)}
                    onSelect={toggleSelected}
                    isInSelectionMode={selected.length > 0}
                    size={'horizontal-sm'}
                  />
                </div>
              ))}
          </AnimatePresence>
        </div>

        <FloatingButtons>
          <NewFlashcardModal
            trigger={
              <Button
                icon={<Plus className='size-4' />}
                size={'icon-square'}
                variant={'primary'}
                alt='Add flashcard'
              />
            }
            handleNewFlashcard={handleNewFlashcards}
            selectedFlashcards={[]}
            handleEditFlashcard={() => {}}
          />

          {selected.length === 0 && (
            <AssignFlashcardsModal
              trigger={
                <m.div
                  key='flashcards-assign-button'
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    icon={<CopyCheck className='size-4' />}
                    size={'icon-square'}
                    variant={'primary'}
                    alt='Assign flashcards'
                  />
                </m.div>
              }
              handleSubmit={handleAssignCards}
              flashcards={flashcards}
              setCards={setFlashcards.map((f) => f.frontUuid) ?? []}
            />
          )}

          {selected.length > 0 && (
            <m.div
              key='flashcards-unassign-button'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleUnassignFlashcards}
                icon={<CopyMinus className='size-4' />}
                size={'icon-square'}
                variant={'destructive'}
                alt='Assign flashcards'
              />
            </m.div>
          )}

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
                alt='Edit set'
              />
            }
          />

          <FlashcardGenerateDialog
            setName={set?.name}
            flashcardCount={setFlashcards.length}
            setDescription={set?.description}
            initialData={set?.generationOptions}
            trigger={
              <Button
                disabled={!isLoggedIn || !isPlanActive}
                icon={<Sparkles className='size-4' />}
                size={'icon-square'}
                variant={'secondary-outline'}
                loading={isGeneratingFlashcards}
                alt='Generate flashcards'
              />
            }
            handleSubmit={handleGenerateFlashcards}
          />
        </FloatingButtons>
      </div>
    </div>
  );
}
