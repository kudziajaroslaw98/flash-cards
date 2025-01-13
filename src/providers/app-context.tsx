import type { ApiFlashcardsSyncResponse } from '#/app/api/flashcard/sync/route';
import type { ApiMetadataSyncResponse } from '#/app/api/metadata/sync/route';
import type { ApiSetsSyncResponse } from '#/app/api/set/sync/route';
import useFetch from '#/hooks/use-fetch.hook';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { FLASHCARDS_LOCAL_STORAGE_INIT } from '#/shared/defaults/flashcards-local-storage-init';
import { SETS_LOCAL_STORAGE_INIT } from '#/shared/defaults/sets-local-storage-init';
import { DEFAULT_METADATA } from '#/shared/defaults/stats.default';
import { generateHash } from '#/shared/utils/generate-hash';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/client';
import uuid from '#/shared/utils/uuid.util';
import type { ApiResponse } from '#/types/api-response.type';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import type { FlashCard, FlashCardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useSessionContext } from './session-provider.component';

export type AppContextType = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  setsDictionary: DictionaryValue<string>[];
  categories: DictionaryValue<string>[];
  metadata: Metadata;
  theme: 'dark' | 'light';
  avatarSeed: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setFlashCards: (flashcards: FlashCard[]) => void;
  addFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  removeFlashCards: (flashcards: FlashCard[]) => void;
  updateFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  updateFlashCard: (flashcard: Partial<FlashCard>) => void;
  assignFlashCardsToSet: (flashcardUuids: string[], setUuid: string) => void;
  setSets: (sets: FlashCardSet[]) => void;
  addSets: (set: Partial<FlashCardSet>[]) => void;
  removeSets: (set: FlashCardSet[]) => void;
  updateSet: (set: Partial<FlashCardSet>) => void;
  updateSets: (sets: Partial<FlashCardSet>[]) => void;
  updateMetadata: (metadata: Partial<Metadata>) => void;
};

export const AppContext = createContext<AppContextType>({
  flashcards: [],
  sets: [],
  setsDictionary: [],
  categories: [],
  metadata: DEFAULT_METADATA,
  theme: 'dark',
  avatarSeed: '',
  setTheme: () => null,
  setFlashCards: () => null,
  addFlashCards: () => null,
  removeFlashCards: () => null,
  updateFlashCards: () => null,
  updateFlashCard: () => null,
  assignFlashCardsToSet: () => null,
  setSets: () => null,
  addSets: () => null,
  removeSets: () => null,
  updateSet: () => null,
  updateSets: () => null,
  updateMetadata: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
  /////////////////
  // #region DEFAULTS
  /////////////////

  const defaultFlashCard = {
    questionAddition: '',
    question: '',
    answer: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spacedRepetition: {
      interval: 0,
      easeFactor: 1.3,
      lastReviewAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      reviews: 0,
    },
    sets: [],
  } as const;

  /////////////////
  // #endregion DEFAULTS
  /////////////////

  /////////////////
  // #region EXTERNAL HOOKS
  /////////////////

  const { fetch } = useFetch();
  const { isLoggedIn, user } = useSessionContext();
  const supabase = createClient();

  /////////////////
  // #endregion EXTERNAL HOOKS
  /////////////////

  /////////////////
  // #region STATE
  /////////////////

  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [flashCardsArray, setFlashCardsArray] = useState<FlashCard[]>([]);
  const [setsArray, setSetsArray] = useState<FlashCardSet[]>([]);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const [setsDictionary, setSetsDictionary] = useState<
    DictionaryValue<string>[]
  >([]);
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const websocketChannel = useRef<ReturnType<typeof supabase.channel>>(undefined);

  /////////////////
  // #endregion STATE
  /////////////////

  /////////////////
  // #region LOCAL STORAGE
  /////////////////

  useLocalStorage({
    key: 'flashcards',
    defaultValue: FLASHCARDS_LOCAL_STORAGE_INIT,
    setArrayValue: setFlashCardsArray,
  });
  useLocalStorage({
    key: 'sets',
    defaultValue: SETS_LOCAL_STORAGE_INIT,
    setArrayValue: setSetsArray,
  });
  useLocalStorage({
    key: 'metadata',
    defaultValue: DEFAULT_METADATA,
    setValue: setMetadata,
  });
  useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
    setValue: setTheme,
  });

  /////////////////
  // #endregion LOCAL STORAGE
  /////////////////

  /////////////////
  // #region FLASHCARDS MANAGEMENT
  /////////////////

  const setFlashCards = (flashcards: FlashCard[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};

    flashcards.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });
    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(flashcards);
  };

  const addFlashCards = async (flashcards: Partial<FlashCard>[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const flashcardSize = flashCardsArray.length;

    const mappedFlashCards: FlashCard[] = flashcards.map((flashCard, index) => {
      const flashCardUuid = flashCard.frontUuid ?? uuid();
      return {
        type: flashCard.type ?? 'index',
        frontUuid: flashCardUuid,
        question: flashCard.question ?? defaultFlashCard.question,
        questionAddition:
          flashCard.questionAddition ?? defaultFlashCard.questionAddition,
        answer: flashCard.answer ?? defaultFlashCard.answer,
        order: flashcardSize + (index + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        spacedRepetition: flashCard.spacedRepetition ?? {
          interval: 0,
          easeFactor: 1.3,
          lastReviewAt: new Date().toISOString(),
          dueDate: new Date(Date.now()).toISOString(),
          reviews: 0,
        },
        sets: flashCard.sets ?? [],
      };
    });

    const flashcardsOutput = [...flashCardsArray, ...mappedFlashCards].map(
      (item, index) => ({
        ...item,
        order: index,
      }),
    );
    flashcardsOutput.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(flashcardsOutput);

    await supabase
      .from('flashcards')
      .insert(
        mappedFlashCards.map((item) => ({ ...item, user_uuid: user?.id })),
      );
  };

  const addFlashCardsFromWebsocket = (flashcard: FlashCard) => {
    setFlashCardsArray((prev) => {
      const exists = prev.some(
        (item) => item.frontUuid === flashcard.frontUuid,
      );

      if (exists) {
        return prev;
      } else {
        const array = [...prev, flashcard].map((item, index) => ({
          ...item,
          order: index,
        }));
        const object: Record<string, FlashCard> = {};
        array.forEach((item) => {
          object[item.frontUuid] = item;
        });
        localStorage.setItem('flashcards', JSON.stringify(object));
        return array;
      }
    });
  };

  const removeFlashCards = async (flashcards: FlashCard[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const flashcardsToDelete: string[] = flashcards.map(
      (item) => item.frontUuid,
    );
    const filteredFlashcards = flashCardsArray
      .filter((item: FlashCard) => !flashcards.includes(item))
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    // It wont work on listening to postgres msg's
    // I need to broadcast messages to other subscribers here.
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsToDelete);

    removeFlashCardsFromSets(flashcardsToDelete);

    filteredFlashcards.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(filteredFlashcards);

    await websocketChannel.current?.send({
      type: 'broadcast',
      event: 'flashcards_delete',
      payload: { flashcards: flashcardsToDelete },
    });
  };

  const removeFlashCardsByUuid = async (uuids: string[]) => {
    setFlashCardsArray((prev) => {
      const filteredFlashcards = prev.filter((item: FlashCard) => {
        if (!uuids.includes(item.frontUuid)) {
          return true;
        }
        return false;
      });
      const object: Record<string, FlashCard> = {};
      filteredFlashcards.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('flashcards', JSON.stringify(object));
      return filteredFlashcards.map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  };

  const updateFlashCards = async (flashcards: Partial<FlashCard>[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const mappedFlashCards: FlashCard[] = flashcards.map(
      (flashCard, index) => ({
        type: flashCard.type ?? 'index',
        frontUuid: flashCard.frontUuid ?? uuid(),
        order: flashCard.order ?? index + 1,
        questionAddition:
          flashCard.questionAddition ?? defaultFlashCard.questionAddition,
        question: flashCard.question ?? defaultFlashCard.question,
        answer: flashCard.answer ?? defaultFlashCard.answer,
        createdAt: flashCard.createdAt ?? defaultFlashCard.createdAt,
        updatedAt: new Date().toISOString(),
        spacedRepetition: {
          interval:
            flashCard.spacedRepetition?.interval ??
            defaultFlashCard.spacedRepetition.interval,
          easeFactor:
            flashCard.spacedRepetition?.easeFactor ??
            defaultFlashCard.spacedRepetition.easeFactor,
          reviews:
            flashCard.spacedRepetition?.reviews ??
            defaultFlashCard.spacedRepetition.reviews,
          lastReviewAt:
            flashCard.spacedRepetition?.lastReviewAt ??
            defaultFlashCard.spacedRepetition.lastReviewAt,
          dueDate:
            flashCard.spacedRepetition?.dueDate ??
            defaultFlashCard.spacedRepetition.dueDate,
        },
        sets: flashCard.sets ?? [],
      }),
    );

    const updatedFlashcards = flashCardsArray.map((flashCard) => {
      const updatedFlashcard =
        mappedFlashCards.find(
          (item) => item.frontUuid === flashCard.frontUuid,
        ) ?? flashCard;

      flashcardsObject[flashCard.frontUuid] = updatedFlashcard;
      return updatedFlashcard;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashcards);

    await Promise.all(
      mappedFlashCards.map((flashcard) =>
        supabase
          .from('flashcards')
          .update(flashcard)
          .eq('frontUuid', flashcard.frontUuid),
      ),
    );
  };

  const updateFlashCard = async (flashCard: Partial<FlashCard>) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const updatedFlashCard: FlashCard = {
      type: flashCard.type ?? ('index' as FlashCardType),
      frontUuid: flashCard.frontUuid ?? uuid(),
      order: flashCard.order ?? flashCardsArray.length + 1,
      questionAddition:
        flashCard.questionAddition ?? defaultFlashCard.questionAddition,
      question: flashCard.question ?? defaultFlashCard.question,
      answer: flashCard.answer ?? defaultFlashCard.answer,
      createdAt: flashCard.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        interval:
          flashCard.spacedRepetition?.interval ??
          defaultFlashCard.spacedRepetition.interval,
        easeFactor:
          flashCard.spacedRepetition?.easeFactor ??
          defaultFlashCard.spacedRepetition.easeFactor,
        reviews:
          flashCard.spacedRepetition?.reviews ??
          defaultFlashCard.spacedRepetition.reviews,
        lastReviewAt:
          flashCard.spacedRepetition?.lastReviewAt ??
          defaultFlashCard.spacedRepetition.lastReviewAt,
        dueDate:
          flashCard.spacedRepetition?.dueDate ??
          defaultFlashCard.spacedRepetition.dueDate,
      },
      sets: flashCard.sets ?? [],
    };

    const updatedFlashCards = flashCardsArray.map((item) => {
      if (item.frontUuid === flashCard.frontUuid) {
        flashcardsObject[item.frontUuid] = updatedFlashCard as FlashCard;
        return updatedFlashCard;
      }

      flashcardsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashCards);

    await supabase
      .from('flashcards')
      .update(updatedFlashCard)
      .eq('frontUuid', flashCard.frontUuid);
  };

  const updateFlashCardsFromWebsocket = (flashcard: FlashCard) => {
    setFlashCardsArray((prev) => {
      const updatedFlashcards = prev.map((item) => {
        if (item.frontUuid === flashcard.frontUuid) {
          return flashcard;
        }
        return item;
      });
      const object: Record<string, FlashCard> = {};
      updatedFlashcards.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('flashcards', JSON.stringify(object));
      return updatedFlashcards;
    });
  };

  const assignFlashCardsToSet = (flashcardUuids: string[], setUuid: string) => {
    setFlashCardsArray((prev: FlashCard[]) => {
      const updatedFlashcards: FlashCard[] = prev.map((item) => {
        if (flashcardUuids.includes(item.frontUuid)) {
          return { ...item, sets: [...(item?.sets ?? []), setUuid] };
        } else if (item?.sets?.includes(setUuid)) {
          return {
            ...item,
            sets: item?.sets?.filter((uuid) => uuid !== setUuid) ?? [],
          };
        }
        return item;
      });

      const object: Record<string, FlashCard> = {};

      updatedFlashcards.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('flashcards', JSON.stringify(object));

      return updatedFlashcards;
    });
  };

  const removeSetsFromFlashCards = (setUuid: string[]) => {
    const flashCardsCopy = flashCardsArray.map((item) => ({
      ...item,
      sets: item.sets.filter((uuid) => !setUuid.includes(uuid)),
    }));

    updateFlashCards(flashCardsCopy);
  };

  /////////////////
  // #endregion FLASHCARDS MANAGEMENT
  /////////////////

  /////////////////
  // #region SETS MANAGEMENT
  /////////////////

  const addSets = async (sets: Partial<FlashCardSet>[]) => {
    const setsObject: Record<string, FlashCardSet> = {};

    const mappedSets: FlashCardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const setsOutput = [...setsArray, ...mappedSets];
    setsOutput.forEach((item: FlashCardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(setsOutput);

    await supabase
      .from('sets')
      .insert(mappedSets.map((item) => ({ ...item, user_uuid: user?.id })));
  };

  const addSetsFromWebsocket = (set: FlashCardSet) => {
    setSetsArray((prev) => {
      const exists = prev.some((item) => item.frontUuid === set.frontUuid);

      if (exists) {
        return prev;
      } else {
        const array = [...prev, set];
        const object: Record<string, FlashCardSet> = {};

        array.forEach((item) => {
          object[item.frontUuid] = item;
        });

        localStorage.setItem('sets', JSON.stringify(object));
        return array;
      }
    });
  };

  const setSets = (sets: FlashCardSet[]) => {
    const setsObject: Record<string, FlashCardSet> = {};
    sets.forEach((item: FlashCardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(sets);
  };

  const removeSets = async (sets: FlashCardSet[]) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const setsToDelete: string[] = sets.map((item) => item.frontUuid);
    const filteredSets = setsArray.filter(
      (item: FlashCardSet) =>
        !sets.some((set) => set.frontUuid === item.frontUuid),
    );

    await supabase.from('sets').delete().in('frontUuid', setsToDelete);

    removeSetsFromFlashCards(setsToDelete);

    filteredSets.forEach((item: FlashCardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(filteredSets);

    await websocketChannel.current?.send({
      type: 'broadcast',
      event: 'sets_delete',
      payload: { sets: setsToDelete },
    });
  };

  const removeSetsByUuid = async (uuids: string[]) => {
    setSetsArray((prev) => {
      const filteredSets = prev.filter((item: FlashCardSet) => {
        if (!uuids.includes(item.frontUuid)) {
          return true;
        }
        return false;
      });
      const object: Record<string, FlashCardSet> = {};
      filteredSets.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('sets', JSON.stringify(object));
      return filteredSets.map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  };

  const removeFlashCardsFromSets = (flashCardUuids: string[]) => {
    const sets = setsArray.map((set) => ({
      ...set,
      flashCards: set.flashCards.filter(
        (uuid) => !flashCardUuids.includes(uuid) || uuid === null,
      ),
    }));

    updateSets(sets);
  };

  const updateSets = async (sets: Partial<FlashCardSet>[]) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const mappedSets: FlashCardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
      createdAt: set.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updatedSets = setsArray.map((set) => {
      const updatedSet =
        mappedSets.find((item) => item.frontUuid === set.frontUuid) ?? set;

      setsObject[set.frontUuid] = updatedSet;
      return updatedSet;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(updatedSets);

    await Promise.all(
      mappedSets.map((set) =>
        supabase.from('sets').update(set).eq('frontUuid', set.frontUuid),
      ),
    );
  };

  const updateSet = async (set: Partial<FlashCardSet>) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const updatedSet = {
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
      createdAt: set.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSets = setsArray.map((item) => {
      if (item.frontUuid === set.frontUuid) {
        setsObject[item.frontUuid] = updatedSet;
        return updatedSet;
      }

      setsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(updatedSets);
  };

  const updateSetsFromWebsocket = (set: FlashCardSet) => {
    setSetsArray((prev) => {
      const updatedSets = prev.map((item) => {
        if (item.frontUuid === set.frontUuid) {
          return set;
        }
        return item;
      });
      const object: Record<string, FlashCardSet> = {};

      updatedSets.forEach((item) => {
        object[item.frontUuid] = item;
      });

      localStorage.setItem('sets', JSON.stringify(object));
      return updatedSets;
    });
  };

  /////////////////
  // #endregion SETS MANAGEMENT
  /////////////////

  /////////////////
  // #region STATS MANAGEMENT
  /////////////////

  const updateMetadata = (update: Partial<Metadata>) => {
    const updatedMetadata = { ...metadata, ...update };

    localStorage.setItem('metadata', JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);
  };

  /////////////////
  // #endregion STATS MANAGEMENT
  /////////////////

  /////////////////
  // #region SYNCHRONIZATION
  /////////////////

  const applyWebsockets = async () => {
    if (!isLoggedIn || !user) return;
    const user_channel = supabase.channel(`user-${user.id}`);
    websocketChannel.current = user_channel;
    // FLASHCARDS - UPDATE
    websocketChannel.current
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'flashcards' },
        (payload) => {
          console.log('flahcard-update', payload);
          if (payload.new) {
            const updatedFlashcard = payload.new as FlashCard & {
              user_uuid: string;
              id: string;
            };
            updateFlashCardsFromWebsocket(
              omit(updatedFlashcard, ['user_uuid', 'id']) as FlashCard,
            );
          }
        },
      )

      // // FLASHCARDS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flashcards' },
        (payload) => {
          console.log('flahcard-insert', payload);
          if (payload.new) {
            const newFlashcard = payload.new as FlashCard & {
              user_uuid: string;
              id: string;
            };
            addFlashCardsFromWebsocket(
              omit(newFlashcard, ['user_uuid', 'id']) as FlashCard,
            );
          }
        },
      )
      // FLASHCARDS - DELETE
      .on('broadcast', { event: 'flashcards_delete' }, ({ payload }) => {
        if (
          payload.flashcards &&
          payload.flashcards.length >= 0 &&
          Array.isArray(payload.flashcards)
        ) {
          removeFlashCardsByUuid(payload.flashcards);
        }
      })

      // SETS - UPDATE
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sets' },
        (payload) => {
          console.log('set-update', payload);
          if (payload.new) {
            const updatedSet = payload.new as FlashCardSet & {
              user_uuid: string;
              id: string;
            };
            updateSetsFromWebsocket(
              omit(updatedSet, ['user_uuid', 'id']) as FlashCardSet,
            );
          }
        },
      )

      // SETS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sets' },
        (payload) => {
          if (payload.new) {
            const newSet = payload.new as FlashCardSet & {
              user_uuid: string;
              id: string;
            };
            addSetsFromWebsocket(omit(newSet, ['user_uuid', 'id']));
          }
        },
      )

      // SETS - DELETE
      .on('broadcast', { event: 'sets_delete' }, ({ payload }) => {
        if (
          payload.sets &&
          payload.sets.length >= 0 &&
          Array.isArray(payload.sets)
        ) {
          removeSetsByUuid(payload.sets);
        }
      })
      .subscribe();
  };

  const syncWithDB = async () => {
    if (!isLoggedIn) return;

    const newLastSyncAt = new Date();
    const oldLastSyncAt = metadata.lastSyncAt;

    const fetchFlashCards: Promise<ApiResponse<ApiFlashcardsSyncResponse>> =
      fetch(API_ROUTES.SYNC_FLASH_CARDS, {
        method: 'POST',
        body: JSON.stringify({
          flashcards: flashCardsArray,
          lastSyncAt: oldLastSyncAt,
        }),
      });

    const fetchSets: Promise<ApiResponse<ApiSetsSyncResponse>> = fetch(
      API_ROUTES.SYNC_SETS,
      {
        method: 'POST',
        body: JSON.stringify({
          sets: setsArray,
          lastSyncAt: oldLastSyncAt,
        }),
      },
    );

    const fetchMetadata: Promise<ApiResponse<ApiMetadataSyncResponse>> = fetch(
      API_ROUTES.SYNC_METADATA,
      {
        method: 'POST',
        body: JSON.stringify({
          metadata: metadata,
          theme: theme,
          newLastSyncAt: newLastSyncAt,
        }),
      },
    );

    const responses = await Promise.allSettled([
      fetchMetadata,
      fetchFlashCards,
      fetchSets,
    ]);

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        if (response.value.success) {
          const value = response.value?.data;

          if ('flashcards' in value) {
            setFlashCardsArray(value.flashcards);
            const flashCardsObject: Record<string, FlashCard> = {};

            value.flashcards.forEach((item: FlashCard) => {
              flashCardsObject[item.frontUuid] = item;
            });

            localStorage.setItem(
              'flashcards',
              JSON.stringify(flashCardsObject),
            );
          } else if ('sets' in value) {
            setSetsArray(value.sets);
            const setsObject: Record<string, FlashCardSet> = {};

            value.sets.forEach((item: FlashCardSet) => {
              setsObject[item.frontUuid] = item;
            });

            localStorage.setItem('sets', JSON.stringify(setsObject));
          } else if ('metadata' in value) {
            setMetadata(value.metadata);
            setTheme(value.theme);

            localStorage.setItem('metadata', JSON.stringify(value.metadata));
            localStorage.setItem('theme', JSON.stringify(value.theme));
          }
        }

        return;
      }
      console.error(response.reason);
    });

    await applyWebsockets();
  };

  /////////////////
  // #endregion SYNCHRONIZATION
  /////////////////

  /////////////////
  // #region MIGRATION
  /////////////////

  const migrateFlashCards = useCallback(() => {
    setFlashCardsArray((prev) => {
      const updatedFlashCards = prev.map((flashCard) => ({
        ...flashCard,
        spacedRepetition: flashCard.spacedRepetition ?? {
          ...defaultFlashCard.spacedRepetition,
        },
      }));

      const flashCardsObject: Record<string, FlashCard> = {};
      updatedFlashCards.forEach((item: FlashCard) => {
        flashCardsObject[item.frontUuid] = item;
      });

      localStorage.setItem('flashcards', JSON.stringify(flashCardsObject));
      return updatedFlashCards;
    });
  }, [flashCardsArray]);

  /////////////////
  // #endregion MIGRATION
  /////////////////

  /////////////////
  // #region MUTATIONS
  /////////////////

  useEffect(() => {
    const categoriesTmp = new Set<string>();
    const setsDictionary: DictionaryValue<string>[] = setsArray.map((item) => ({
      label: item.name,
      value: item.frontUuid,
    }));

    setsArray.forEach((set) => {
      if (set.category) {
        categoriesTmp.add(set.category);
      }
    });

    const selectCategoriesAsDictionary: DictionaryValue<string>[] = Array.from(
      categoriesTmp,
    ).map((item) => ({
      label: item,
      value: item,
    }));

    setCategories(selectCategoriesAsDictionary);
    setSetsDictionary(setsDictionary);
  }, [setsArray]);

  useEffect(() => {
    if (
      flashCardsArray.some(
        (flashCard) =>
          flashCard.spacedRepetition === undefined ||
          flashCard.spacedRepetition === null,
      )
    ) {
      migrateFlashCards();
    }
  }, [flashCardsArray, migrateFlashCards]);

  useEffect(() => {
    setAvatarSeed(generateHash());
  }, []);

  // useEffect(() => {
  //   if (!metadataInitiated) return;

  //   if (metadata.lastSyncAt) {
  //     const now = new Date();
  //     const lastSyncAt = new Date(metadata.lastSyncAt);

  //     const dayNow = now.getDate();
  //     const dayLastSyncAt = lastSyncAt.getDate();

  //     const isNewDay = dayNow !== dayLastSyncAt;

  //     setMetadata((prev) => ({
  //       ...prev,
  //       streak: isNewDay ? prev.streak + 1 : prev.streak,
  //     }));
  //     localStorage.setItem('metadata', JSON.stringify(metadata));
  //   }
  // }, [metadataInitiated]);

  useEffect(() => {
    if (!isLoggedIn) return;
    syncWithDB();

    return () => {
      if (websocketChannel.current) {
        websocketChannel.current.unsubscribe();
        supabase.removeChannel(websocketChannel.current);
      }
    };
  }, [isLoggedIn]);

  /////////////////
  // #endregion MUTATIONS
  /////////////////

  return (
    <AppContext.Provider
      value={{
        flashcards: flashCardsArray.sort((a, b) => a.order - b.order),
        sets: setsArray,
        setsDictionary,
        categories,
        metadata: metadata,
        theme: theme,
        avatarSeed: avatarSeed,
        setTheme,
        setFlashCards,
        addFlashCards,
        removeFlashCards,
        updateFlashCards,
        updateFlashCard,
        assignFlashCardsToSet,
        setSets,
        addSets,
        removeSets,
        updateSets,
        updateSet,
        updateMetadata,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};
