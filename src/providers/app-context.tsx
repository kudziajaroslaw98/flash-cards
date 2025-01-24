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
import isNewerVersion from '#/shared/utils/is-newer-version';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/client';
import uuid from '#/shared/utils/uuid.util';
import type { ApiResponse } from '#/types/api-response.type';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useSessionContext } from './session-provider.component';

export type AppContextType = {
  flashcards: Flashcard[];
  sets: FlashcardSet[];
  setsDictionary: DictionaryValue<string>[];
  categories: DictionaryValue<string>[];
  metadata: Metadata;
  theme: 'dark' | 'light';
  avatarSeed: string;
  flashcardTypeDictionaries: DictionaryValue<FlashcardType>[];
  setTheme: (theme: 'dark' | 'light') => void;
  setFlashcards: (flashcards: Flashcard[]) => void;
  addFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  removeFlashcards: (flashcards: Flashcard[]) => void;
  updateFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  updateFlashcard: (flashcard: Partial<Flashcard>) => void;
  assignFlashcardsToSet: (flashcardUuids: string[], setUuid: string) => void;
  setSets: (sets: FlashcardSet[]) => void;
  addSets: (set: Partial<FlashcardSet>[]) => void;
  removeSets: (set: FlashcardSet[]) => void;
  updateSet: (set: Partial<FlashcardSet>) => void;
  updateSets: (sets: Partial<FlashcardSet>[]) => void;
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
  flashcardTypeDictionaries: [],
  setTheme: () => null,
  setFlashcards: () => null,
  addFlashcards: () => null,
  removeFlashcards: () => null,
  updateFlashcards: () => null,
  updateFlashcard: () => null,
  assignFlashcardsToSet: () => null,
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

  const defaultFlashcard = {
    context: '',
    query: '',
    definition: '',
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
    examples: '',
    keyPoints: '',
    synonyms: '',
    relatedFacts: '',
  } as const;

  const defaultSet: FlashcardSet = {
    frontUuid: uuid(),
    name: '',
    description: '',
    category: '',
    isFavourite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flashcards: [],
    hardlink: '',
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
  const [migration, setMigration] = useState<{
    flashcards: string | null;
    sets: string | null;
  }>({ flashcards: null, sets: null });
  const [appVersion, setAppVersion] = useState<string>('');
  const [flashcardsArray, setFlashcardsArray] = useState<Flashcard[]>([]);
  const [setsArray, setSetsArray] = useState<FlashcardSet[]>([]);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const [setsDictionary, setSetsDictionary] = useState<
    DictionaryValue<string>[]
  >([]);
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const websocketChannel =
    useRef<ReturnType<typeof supabase.channel>>(undefined);
  const flashcardTypeDictionaries: DictionaryValue<FlashcardType>[] = [
    { value: 'index', label: 'Index Flashcard' },
    { value: 'question', label: 'Question with answer' },
    { value: 'single', label: 'Detailed Flashcard' },
  ];

  /////////////////
  // #endregion STATE
  /////////////////

  /////////////////
  // #region LOCAL STORAGE
  /////////////////

  useLocalStorage({
    key: 'flashcards',
    defaultValue: FLASHCARDS_LOCAL_STORAGE_INIT,
    setArrayValue: setFlashcardsArray,
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
  useLocalStorage({
    key: 'appVersion',
    defaultValue: '1.0.1',
    setValue: setAppVersion,
  });
  useLocalStorage({
    key: 'migrations',
    defaultValue: { flashcards: '', sets: '' },
    setValue: setMigration,
  });

  /////////////////
  // #endregion LOCAL STORAGE
  /////////////////

  /////////////////
  // #region FLASHCARDS MANAGEMENT
  /////////////////

  const setFlashcards = (flashcards: Flashcard[]) => {
    const flashcardsObject: Record<string, Flashcard> = {};

    flashcards.forEach((item: Flashcard) => {
      flashcardsObject[item.frontUuid] = item;
    });
    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashcardsArray(flashcards);
  };

  const addFlashcards = async (flashcards: Partial<Flashcard>[]) => {
    const flashcardsObject: Record<string, Flashcard> = {};
    const flashcardSize = flashcardsArray.length;

    const mappedFlashcards: Flashcard[] = flashcards.map((flashcard, index) => {
      const flashcardUuid = flashcard.frontUuid ?? uuid();
      return {
        type: flashcard.type ?? 'index',
        frontUuid: flashcardUuid,
        query: flashcard.query ?? defaultFlashcard.query,
        context: flashcard.context ?? defaultFlashcard.context,
        definition: flashcard.definition ?? defaultFlashcard.definition,
        order: flashcardSize + (index + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        spacedRepetition: flashcard.spacedRepetition ?? {
          interval: 0,
          easeFactor: 1.3,
          lastReviewAt: new Date().toISOString(),
          dueDate: new Date(Date.now()).toISOString(),
          reviews: 0,
        },
        sets: flashcard?.sets ?? [],
        examples: flashcard?.examples ?? defaultFlashcard.examples,
        keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
        synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
        relatedFacts: flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
      };
    });

    const flashcardsOutput = [...flashcardsArray, ...mappedFlashcards].map(
      (item, index) => ({
        ...item,
        order: index,
      }),
    );
    flashcardsOutput.forEach((item: Flashcard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashcardsArray(flashcardsOutput);

    await supabase
      .from('flashcards')
      .insert(
        mappedFlashcards.map((item) => ({ ...item, user_uuid: user?.id })),
      );
  };

  const addFlashcardsFromWebsocket = (flashcard: Flashcard) => {
    setFlashcardsArray((prev) => {
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
        const object: Record<string, Flashcard> = {};
        array.forEach((item) => {
          object[item.frontUuid] = item;
        });
        localStorage.setItem('flashcards', JSON.stringify(object));
        return array;
      }
    });
  };

  const removeFlashcards = async (flashcards: Flashcard[]) => {
    const flashcardsObject: Record<string, Flashcard> = {};
    const flashcardsToDelete: string[] = flashcards.map(
      (item) => item.frontUuid,
    );
    const filteredFlashcards = flashcardsArray
      .filter((item: Flashcard) => !flashcards.includes(item))
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

    removeFlashcardsFromSets(flashcardsToDelete);

    filteredFlashcards.forEach((item: Flashcard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashcardsArray(filteredFlashcards);

    await websocketChannel.current?.send({
      type: 'broadcast',
      event: 'flashcards_delete',
      payload: { flashcards: flashcardsToDelete },
    });
  };

  const removeFlashcardsByUuid = async (uuids: string[]) => {
    setFlashcardsArray((prev) => {
      const filteredFlashcards = prev.filter((item: Flashcard) => {
        if (!uuids.includes(item.frontUuid)) {
          return true;
        }
        return false;
      });
      const object: Record<string, Flashcard> = {};
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

  const updateFlashcards = async (flashcards: Partial<Flashcard>[]) => {
    const flashcardsObject: Record<string, Flashcard> = {};
    const mappedFlashcards: Flashcard[] = flashcards.map(
      (flashcard, index) => ({
        type: flashcard.type ?? 'index',
        frontUuid: flashcard.frontUuid ?? uuid(),
        order: flashcard.order ?? index + 1,
        context: flashcard.context ?? defaultFlashcard.context,
        query: flashcard.query ?? defaultFlashcard.query,
        definition: flashcard.definition ?? defaultFlashcard.definition,
        createdAt: flashcard.createdAt ?? defaultFlashcard.createdAt,
        updatedAt: new Date().toISOString(),
        spacedRepetition: {
          interval:
            flashcard.spacedRepetition?.interval ??
            defaultFlashcard.spacedRepetition.interval,
          easeFactor:
            flashcard.spacedRepetition?.easeFactor ??
            defaultFlashcard.spacedRepetition.easeFactor,
          reviews:
            flashcard.spacedRepetition?.reviews ??
            defaultFlashcard.spacedRepetition.reviews,
          lastReviewAt:
            flashcard.spacedRepetition?.lastReviewAt ??
            defaultFlashcard.spacedRepetition.lastReviewAt,
          dueDate:
            flashcard.spacedRepetition?.dueDate ??
            defaultFlashcard.spacedRepetition.dueDate,
        },
        sets: flashcard?.sets ?? [],
        examples: flashcard?.examples ?? defaultFlashcard.examples,
        keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
        synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
        relatedFacts: flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
      }),
    );

    const updatedFlashcards = flashcardsArray.map((flashcard) => {
      const updatedFlashcard =
        mappedFlashcards.find(
          (item) => item.frontUuid === flashcard.frontUuid,
        ) ?? flashcard;

      flashcardsObject[flashcard.frontUuid] = updatedFlashcard;
      return updatedFlashcard;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashcardsArray(updatedFlashcards);

    await Promise.all(
      mappedFlashcards.map((flashcard) =>
        supabase
          .from('flashcards')
          .update(flashcard)
          .eq('frontUuid', flashcard.frontUuid),
      ),
    );
  };

  const updateFlashcard = async (flashcard: Partial<Flashcard>) => {
    const flashcardsObject: Record<string, Flashcard> = {};
    const updatedFlashcard: Flashcard = {
      type: flashcard.type ?? ('index' as FlashcardType),
      frontUuid: flashcard.frontUuid ?? uuid(),
      order: flashcard.order ?? flashcardsArray.length + 1,
      context: flashcard.context ?? defaultFlashcard.context,
      query: flashcard.query ?? defaultFlashcard.query,
      definition: flashcard.definition ?? defaultFlashcard.definition,
      createdAt: flashcard.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spacedRepetition: {
        interval:
          flashcard.spacedRepetition?.interval ??
          defaultFlashcard.spacedRepetition.interval,
        easeFactor:
          flashcard.spacedRepetition?.easeFactor ??
          defaultFlashcard.spacedRepetition.easeFactor,
        reviews:
          flashcard.spacedRepetition?.reviews ??
          defaultFlashcard.spacedRepetition.reviews,
        lastReviewAt:
          flashcard.spacedRepetition?.lastReviewAt ??
          defaultFlashcard.spacedRepetition.lastReviewAt,
        dueDate:
          flashcard.spacedRepetition?.dueDate ??
          defaultFlashcard.spacedRepetition.dueDate,
      },
      sets: flashcard?.sets ?? [],
      examples: flashcard?.examples ?? defaultFlashcard.examples,
      keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
      synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
      relatedFacts: flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
    };

    const updatedFlashcards = flashcardsArray.map((item) => {
      if (item.frontUuid === flashcard.frontUuid) {
        flashcardsObject[item.frontUuid] = updatedFlashcard as Flashcard;
        return updatedFlashcard;
      }

      flashcardsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashcardsArray(updatedFlashcards);

    await supabase
      .from('flashcards')
      .update(updatedFlashcard)
      .eq('frontUuid', flashcard.frontUuid);
  };

  const updateFlashcardsFromWebsocket = (flashcard: Flashcard) => {
    setFlashcardsArray((prev) => {
      const updatedFlashcards = prev.map((item) => {
        if (item.frontUuid === flashcard.frontUuid) {
          return flashcard;
        }
        return item;
      });
      const object: Record<string, Flashcard> = {};
      updatedFlashcards.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('flashcards', JSON.stringify(object));
      return updatedFlashcards;
    });
  };

  const assignFlashcardsToSet = (flashcardUuids: string[], setUuid: string) => {
    setFlashcardsArray((prev: Flashcard[]) => {
      const updatedFlashcards: Flashcard[] = prev.map((item) => {
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

      const object: Record<string, Flashcard> = {};

      updatedFlashcards.forEach((item) => {
        object[item.frontUuid] = item;
      });
      localStorage.setItem('flashcards', JSON.stringify(object));

      return updatedFlashcards;
    });
  };

  const removeSetsFromFlashcards = (setUuid: string[]) => {
    const flashcardsCopy = flashcardsArray.map((item) => ({
      ...item,
      sets: item.sets?.filter((uuid) => !setUuid.includes(uuid)),
    }));

    updateFlashcards(flashcardsCopy);
  };

  /////////////////
  // #endregion FLASHCARDS MANAGEMENT
  /////////////////

  /////////////////
  // #region SETS MANAGEMENT
  /////////////////

  const addSets = async (sets: Partial<FlashcardSet>[]) => {
    const setsObject: Record<string, FlashcardSet> = {};

    const mappedSets: FlashcardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashcards: set.flashcards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const setsOutput = [...setsArray, ...mappedSets];
    setsOutput.forEach((item: FlashcardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(setsOutput);

    await supabase
      .from('sets')
      .insert(mappedSets.map((item) => ({ ...item, user_uuid: user?.id })));
  };

  const addSetsFromWebsocket = (set: FlashcardSet) => {
    setSetsArray((prev) => {
      const exists = prev.some((item) => item.frontUuid === set.frontUuid);

      if (exists) {
        return prev;
      } else {
        const array = [...prev, set];
        const object: Record<string, FlashcardSet> = {};

        array.forEach((item) => {
          object[item.frontUuid] = item;
        });

        localStorage.setItem('sets', JSON.stringify(object));
        return array;
      }
    });
  };

  const setSets = (sets: FlashcardSet[]) => {
    const setsObject: Record<string, FlashcardSet> = {};
    sets.forEach((item: FlashcardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(sets);
  };

  const removeSets = async (sets: FlashcardSet[]) => {
    const setsObject: Record<string, FlashcardSet> = {};
    const setsToDelete: string[] = sets.map((item) => item.frontUuid);
    const filteredSets = setsArray.filter(
      (item: FlashcardSet) =>
        !sets.some((set) => set.frontUuid === item.frontUuid),
    );

    await supabase.from('sets').delete().in('frontUuid', setsToDelete);

    removeSetsFromFlashcards(setsToDelete);

    filteredSets.forEach((item: FlashcardSet) => {
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
      const filteredSets = prev.filter((item: FlashcardSet) => {
        if (!uuids.includes(item.frontUuid)) {
          return true;
        }
        return false;
      });
      const object: Record<string, FlashcardSet> = {};
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

  const removeFlashcardsFromSets = (flashcardUuids: string[]) => {
    const sets = setsArray.map((set) => ({
      ...set,
      flashcards: set.flashcards.filter(
        (uuid) => !flashcardUuids.includes(uuid) || uuid === null,
      ),
    }));

    updateSets(sets);
  };

  const updateSets = async (sets: Partial<FlashcardSet>[]) => {
    const setsObject: Record<string, FlashcardSet> = {};
    const mappedSets: FlashcardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashcards: set.flashcards ?? [],
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

  const updateSet = async (set: Partial<FlashcardSet>) => {
    const setsObject: Record<string, FlashcardSet> = {};
    const updatedSet = {
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashcards: set.flashcards ?? [],
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

  const updateSetsFromWebsocket = (set: FlashcardSet) => {
    setSetsArray((prev) => {
      const updatedSets = prev.map((item) => {
        if (item.frontUuid === set.frontUuid) {
          return set;
        }
        return item;
      });
      const object: Record<string, FlashcardSet> = {};

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
          if (payload.new) {
            const updatedFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            updateFlashcardsFromWebsocket(
              omit(updatedFlashcard, ['user_uuid', 'id']) as Flashcard,
            );
          }
        },
      )

      // // FLASHCARDS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flashcards' },
        (payload) => {
          if (payload.new) {
            const newFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            addFlashcardsFromWebsocket(
              omit(newFlashcard, ['user_uuid', 'id']) as Flashcard,
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
          removeFlashcardsByUuid(payload.flashcards);
        }
      })

      // SETS - UPDATE
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sets' },
        (payload) => {
          if (payload.new) {
            const updatedSet = payload.new as FlashcardSet & {
              user_uuid: string;
              id: string;
            };
            updateSetsFromWebsocket(
              omit(updatedSet, ['user_uuid', 'id']) as FlashcardSet,
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
            const newSet = payload.new as FlashcardSet & {
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
          payload?.sets &&
          payload?.sets.length >= 0 &&
          Array.isArray(payload?.sets)
        ) {
          removeSetsByUuid(payload?.sets);
        }
      })
      .subscribe();
  };

  const syncWithDB = async () => {
    if (!isLoggedIn) return;

    const newLastSyncAt = new Date();
    const oldLastSyncAt = metadata.lastSyncAt;

    const fetchFlashcards: Promise<ApiResponse<ApiFlashcardsSyncResponse>> =
      fetch(API_ROUTES.SYNC_FLASH_CARDS, {
        method: 'POST',
        body: JSON.stringify({
          flashcards: flashcardsArray,
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
      fetchFlashcards,
      fetchSets,
    ]);

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        if (response.value.success) {
          const value = response.value?.data;

          if ('flashcards' in value) {
            setFlashcardsArray(value.flashcards);
            const flashcardsObject: Record<string, Flashcard> = {};

            value.flashcards.forEach((item: Flashcard) => {
              flashcardsObject[item.frontUuid] = item;
            });

            localStorage.setItem(
              'flashcards',
              JSON.stringify(flashcardsObject),
            );
          } else if ('sets' in value) {
            setSetsArray(value?.sets);
            const setsObject: Record<string, FlashcardSet> = {};

            value?.sets?.forEach((item: FlashcardSet) => {
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

  const migrateFlashcards = () => {
    if (!appVersion) return;
    if (
      migration.flashcards === null ||
      isNewerVersion(migration.flashcards, '1.0.0')
    ) {
      setFlashcardsArray((prev) => {
        const flashcardsObject: Record<string, Flashcard> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unknownFlashcards = prev as any[];

        const updatedFlashcards = unknownFlashcards.map((flashcard) => {
          const migratedFlashcard = {
            type: flashcard?.type ?? ('index' as FlashcardType),
            frontUuid: flashcard?.frontUuid ?? uuid(),
            question: flashcard?.question ?? defaultFlashcard.query,
            questionAddition:
              flashcard?.questionAddition ?? defaultFlashcard.context,
            answer: flashcard?.answer ?? defaultFlashcard.definition,
            order: flashcard?.order ?? flashcardsArray.length + 1,
            createdAt: flashcard?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            spacedRepetition: {
              interval:
                flashcard?.spacedRepetition?.interval ??
                defaultFlashcard.spacedRepetition.interval,
              easeFactor:
                flashcard?.spacedRepetition?.easeFactor ??
                defaultFlashcard.spacedRepetition.easeFactor,
              reviews:
                flashcard?.spacedRepetition?.reviews ??
                defaultFlashcard.spacedRepetition.reviews,
              lastReviewAt:
                flashcard?.spacedRepetition?.lastReviewAt ??
                defaultFlashcard.spacedRepetition.lastReviewAt,
              dueDate:
                flashcard?.spacedRepetition?.dueDate ??
                defaultFlashcard.spacedRepetition.dueDate,
            },
            sets: flashcard?.sets ?? [],
          };

          flashcardsObject[migratedFlashcard.frontUuid] =
            migratedFlashcard as unknown as Flashcard;
          return migratedFlashcard as unknown as Flashcard;
        });

        localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
        setMigration((prev) => {
          localStorage.setItem(
            'migrations',
            JSON.stringify({ ...prev, flashcards: '1.0.0' }),
          );

          return { ...prev, flashcards: '1.0.0' };
        });
        return updatedFlashcards;
      });
    } else if (
      migration.flashcards !== null &&
      isNewerVersion(migration.flashcards, '1.0.1')
    ) {
      setFlashcardsArray((prev) => {
        console.log('prev', prev);
        const flashcardsObject: Record<string, Flashcard> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unknownFlashcards = prev as any[];

        const updatedFlashcards = unknownFlashcards.map((flashcard) => {
          const migratedFlashcard: Flashcard = {
            type: flashcard?.type ?? ('index' as FlashcardType),
            frontUuid: flashcard?.frontUuid ?? uuid(),
            query: flashcard?.question ?? defaultFlashcard.query,
            context: flashcard?.questionAddition ?? defaultFlashcard.context,
            definition: flashcard?.answer ?? defaultFlashcard.definition,
            order: flashcard?.order ?? flashcardsArray.length + 1,
            createdAt: flashcard?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            spacedRepetition: {
              interval:
                flashcard?.spacedRepetition?.interval ??
                defaultFlashcard.spacedRepetition.interval,
              easeFactor:
                flashcard?.spacedRepetition?.easeFactor ??
                defaultFlashcard.spacedRepetition.easeFactor,
              reviews:
                flashcard?.spacedRepetition?.reviews ??
                defaultFlashcard.spacedRepetition.reviews,
              lastReviewAt:
                flashcard?.spacedRepetition?.lastReviewAt ??
                defaultFlashcard.spacedRepetition.lastReviewAt,
              dueDate:
                flashcard?.spacedRepetition?.dueDate ??
                defaultFlashcard.spacedRepetition.dueDate,
            },
            sets: flashcard?.sets ?? [],
            examples: flashcard?.examples ?? defaultFlashcard.examples,
            keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
            synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
            relatedFacts:
              flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
          };

          flashcardsObject[migratedFlashcard.frontUuid] = migratedFlashcard;
          return migratedFlashcard;
        });

        localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
        setMigration((prev) => {
          localStorage.setItem(
            'migrations',
            JSON.stringify({ ...prev, flashcards: '1.0.1' }),
          );

          return { ...prev, flashcards: '1.0.1' };
        });

        return updatedFlashcards;
      });
    }
  };

  const migrateSets = () => {
    if (!appVersion) return;
    if (migration.sets === null || isNewerVersion(migration.sets, '1.0.0')) {
      setSetsArray((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unknownSets = prev as any[];
        const setsObject: Record<string, FlashcardSet> = {};
        const updatedSets = unknownSets.map((set) => {
          const setFlashcards = set?.flashcards ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updatedFlashcards = setFlashcards?.map((flashcard: any) => {
            if (typeof flashcard === 'string') {
              return flashcard;
            } else {
              return flashcard.frontUuid;
            }
          });
          const migratedSet: FlashcardSet = {
            frontUuid: set?.frontUuid ?? uuid(),
            name: set?.name ?? defaultSet.name,
            description: set?.description ?? defaultSet.description,
            category: set?.category ?? defaultSet.category,
            isFavourite: set?.isFavourite ?? defaultSet.isFavourite,
            createdAt: set?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hardlink:
              set?.hardlink ??
              (set?.name as string)?.replace(/ /g, '-')?.toLowerCase() ??
              '',
            flashcards: updatedFlashcards,
          };

          setsObject[migratedSet.frontUuid] = migratedSet;
          return migratedSet;
        });

        localStorage.setItem('sets', JSON.stringify(setsObject));
        setMigration((prev) => {
          localStorage.setItem(
            'migrations',
            JSON.stringify({ ...prev, sets: '1.0.0' }),
          );

          return { ...prev, sets: '1.0.0' };
        });
        return updatedSets;
      });
    } else if (
      migration.sets !== null &&
      isNewerVersion(migration.sets, '1.0.1')
    ) {
      setSetsArray((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unknownSets = prev as any[];
        const setsObject: Record<string, FlashcardSet> = {};
        const updatedSets = unknownSets.map((set) => {
          const migratedSet: FlashcardSet = {
            frontUuid: set?.frontUuid ?? uuid(),
            name: set?.name ?? defaultSet.name,
            description: set?.description ?? defaultSet.description,
            category: set?.category ?? defaultSet.category,
            isFavourite: set?.isFavourite ?? defaultSet.isFavourite,
            createdAt: set?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hardlink:
              set?.hardlink ??
              (set?.name as string)?.replace(/ /g, '-')?.toLowerCase() ??
              '',
            flashcards: set?.flashCards ?? [],
          };

          setsObject[migratedSet.frontUuid] = migratedSet;
          return migratedSet;
        });

        localStorage.setItem('sets', JSON.stringify(setsObject));
        setMigration((prev) => {
          localStorage.setItem(
            'migrations',
            JSON.stringify({ ...prev, sets: '1.0.1' }),
          );

          return { ...prev, sets: '1.0.1' };
        });
        return updatedSets;
      });
    }
  };

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
    if (!appVersion) return;

    if (flashcardsArray.length > 0) {
      migrateFlashcards();
    }

    if (setsArray.length > 0) {
      migrateSets();
    }

    if (migration.flashcards === '1.0.1' && migration.sets === '1.0.1') {
      localStorage.setItem('appVersion', JSON.stringify('1.0.1'));
      setAppVersion('1.0.1');
    }
  }, [
    appVersion,
    flashcardsArray,
    setsArray,
    migrateFlashcards,
    migrateSets,
    setFlashcardsArray,
    setSetsArray,
  ]);

  useEffect(() => {
    setAvatarSeed(generateHash());
  }, []);

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
        flashcards: flashcardsArray.sort((a, b) => a.order - b.order),
        sets: setsArray,
        setsDictionary,
        categories,
        metadata: metadata,
        theme: theme,
        avatarSeed: avatarSeed,
        flashcardTypeDictionaries: flashcardTypeDictionaries,
        setTheme,
        setFlashcards: setFlashcards,
        addFlashcards: addFlashcards,
        removeFlashcards: removeFlashcards,
        updateFlashcards: updateFlashcards,
        updateFlashcard: updateFlashcard,
        assignFlashcardsToSet: assignFlashcardsToSet,
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
