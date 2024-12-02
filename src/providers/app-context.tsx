import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { FLASHCARDS_LOCAL_STORAGE_INIT } from '#/shared/defaults/flashcards-local-storage-init';
import { SETS_LOCAL_STORAGE_INIT } from '#/shared/defaults/sets-local-storage-init';
import type { ApiFlashcardsSyncResponse } from '#/app/api/flashcard/sync/route';
import type { ApiMetadataSyncResponse } from '#/app/api/metadata/sync/route';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { ApiSetsSyncResponse } from '#/app/api/set/sync/route';
import { DEFAULT_METADATA } from '#/shared/defaults/stats.default';
import type { FlashCard } from '#/shared/models/flash-card.model';
import { useSessionContext } from './session-provider.component';
import { createClient } from '#/shared/utils/supabase/client';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import type { ApiResponse } from '#/types/api-response.type';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import type { Metadata } from '#/types/metadata.type';
import useFetch from '#/hooks/use-fetch.hook';
import omit from '#/shared/utils/omit.util';
import uuid from '#/shared/utils/uuid.util';

export type AppContextType = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  setsDictionary: DictionaryValue<string>[];
  categories: DictionaryValue<string>[];
  metadata: Metadata;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  setFlashCards: (flashcards: FlashCard[]) => void;
  addFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  removeFlashCards: (flashcards: FlashCard[]) => void;
  updateFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  updateFlashCard: (flashcard: Partial<FlashCard>) => void;
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
  setTheme: () => null,
  setFlashCards: () => null,
  addFlashCards: () => null,
  removeFlashCards: () => null,
  updateFlashCards: () => null,
  updateFlashCard: () => null,
  setSets: () => null,
  addSets: () => null,
  removeSets: () => null,
  updateSet: () => null,
  updateSets: () => null,
  updateMetadata: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
  /////////////////
  // EXTERNAL HOOKS
  /////////////////

  const { fetch } = useFetch();
  const { isLoggedIn, user } = useSessionContext();
  const supabase = createClient();

  /////////////////
  // STATE
  /////////////////

  const [flashCardsArray, setFlashCardsArray] = useState<FlashCard[]>([]);
  const [setsArray, setSetsArray] = useState<FlashCardSet[]>([]);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const [setsDictionary, setSetsDictionary] = useState<
    DictionaryValue<string>[]
  >([]);
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const websocketChannel = useRef<ReturnType<typeof supabase.channel>>();

  /////////////////
  // LOCAL STORAGE
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
  // FLASHCARDS MANAGEMENT
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
        frontUuid: flashCardUuid,
        question: flashCard.question ?? '',
        questionAddition: flashCard.questionAddition ?? '',
        answer: flashCard.answer ?? '',
        order: flashcardSize + (index + 1),
        createdAt: new Date(),
        updatedAt: new Date(),
        weight: 1.0,
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
    const flashcardsToDelete: string[] = [];
    const filteredFlashcards = flashCardsArray
      .filter((item: FlashCard) => {
        if (!flashcards.includes(item)) {
          return true;
        }
        flashcardsToDelete.push(item.frontUuid);
        return false;
      })
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    // TODO: It wont work on listening to postgres msg's
    // I need to broadcast messages to other subscribers here.
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsToDelete);

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
        frontUuid: flashCard.frontUuid ?? uuid(),
        order: flashCard.order ?? index + 1,
        weight: flashCard.weight ?? 1.0,
        questionAddition: flashCard.questionAddition ?? '',
        question: flashCard.question ?? '',
        answer: flashCard.answer ?? '',
        createdAt: flashCard.createdAt ?? new Date(),
        updatedAt: new Date(),
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
      updatedFlashcards.map((flashcard) =>
        supabase
          .from('flashcards')
          .update(flashcard)
          .eq('frontUuid', flashcard.frontUuid),
      ),
    );
  };

  const updateFlashCard = async (flashcard: Partial<FlashCard>) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const updatedFlashcard = {
      frontUuid: flashcard.frontUuid ?? uuid(),
      order: flashcard.order ?? flashCardsArray.length + 1,
      weight: flashcard.weight ?? 1.0,
      questionAddition: flashcard.questionAddition ?? '',
      question: flashcard.question ?? '',
      answer: flashcard.answer ?? '',
      createdAt: flashcard.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    const updatedFlashcards = flashCardsArray.map((item) => {
      if (item.frontUuid === flashcard.frontUuid) {
        flashcardsObject[item.frontUuid] = updatedFlashcard;
        return updatedFlashcard;
      }

      flashcardsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashcards);

    await supabase
      .from('flashcards')
      .update(updatedFlashcard)
      .eq('frontUuid', flashcard.frontUuid);
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

  /////////////////
  // SETS MANAGEMENT
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const setsToDelete: string[] = [];
    const filteredSets = setsArray.filter((item: FlashCardSet) => {
      if (!sets.some((set) => set.frontUuid === item.frontUuid)) {
        return true;
      } else {
        setsToDelete.push(item.frontUuid);
        return false;
      }
    });

    await supabase.from('sets').delete().in('frontUuid', setsToDelete);

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
      createdAt: set.createdAt ?? new Date(),
      updatedAt: new Date(),
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
      updatedSets.map((set) =>
        supabase.from('sets').update(set).eq('frontUuid', set.frontUuid),
      ),
    );
  };

  const updateSet = (set: Partial<FlashCardSet>) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const updatedSet = {
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
      createdAt: set.createdAt ?? new Date(),
      updatedAt: new Date(),
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
  // STATS MANAGEMENT
  /////////////////

  const updateMetadata = (update: Partial<Metadata>) => {
    const updatedMetadata = { ...metadata, ...update };

    localStorage.setItem('metadata', JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);
  };

  /////////////////
  // SYNCHRONIZATION
  /////////////////

  const applyWebsockets = async () => {
    if (!isLoggedIn) return;
    const { data } = await supabase.auth.getUser();
    const user_channel = supabase.channel(`user-${data.user?.id}`);
    websocketChannel.current = user_channel;
    // FLASHCARDS - UPDATE
    websocketChannel.current
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'flashcards' },
        (payload) => {
          console.log("🚀 ~ applyWebsockets ~ payload:", payload)
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
          console.log('🚀 ~ applyWebsockets ~ payload:', payload);

          if (payload.new) {
            const newFlashcard = payload.new as FlashCard & {
              user_uuid: string;
              id: string;
            };
            addFlashCardsFromWebsocket(omit(newFlashcard, ['user_uuid', 'id']));
          }
        },
      )

      // FLASHCARDS - DELETE
      .on('broadcast', { event: 'flashcards_delete' }, ({ payload }) => {
        console.log('🚀 ~ .on ~ payload:', payload);

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
          console.log(payload);
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
          console.log(payload);
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
        console.log(payload);
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
      fetchFlashCards,
      fetchSets,
      fetchMetadata,
    ]);

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        if (response.value.success) {
          const value = response.value.data;

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
          } else {
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
  // MIGRATION
  /////////////////

  const migrateSets = useCallback(() => {
    setSetsArray((prev) => {
      const updatedSets = prev.map((set) => ({
        ...set,
        flashCards: flashCardsArray.filter((flashCard) =>
          set.flashCards.includes(flashCard.frontUuid as unknown as FlashCard),
        ),
      }));
      const setsObject: Record<string, FlashCardSet> = {};
      updatedSets.forEach((item: FlashCardSet) => {
        setsObject[item.frontUuid] = item;
      });

      localStorage.setItem('sets', JSON.stringify(setsObject));
      return updatedSets;
    });
  }, [flashCardsArray]);

  /////////////////
  // MUTATIONS
  /////////////////

  useEffect(() => {
    if (
      setsArray.some(
        (set) =>
          set.flashCards.length > 0 &&
          set.flashCards.at(0)?.frontUuid === undefined,
      )
    ) {
      migrateSets();
    }

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
  }, [setsArray, migrateSets]);

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

  return (
    <AppContext.Provider
      value={{
        flashcards: flashCardsArray.sort((a, b) => a.order - b.order),
        sets: setsArray,
        setsDictionary,
        categories,
        metadata: metadata,
        theme: theme,
        setTheme,
        setFlashCards,
        addFlashCards,
        removeFlashCards,
        updateFlashCards,
        updateFlashCard,
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
