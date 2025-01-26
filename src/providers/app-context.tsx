import { db } from '#/db/dexie.db';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { DEFAULT_METADATA } from '#/shared/defaults/stats.default';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { metadataMerge } from '#/shared/helpers/metadata-merge';
import { setsMerge } from '#/shared/helpers/sets-merge';
import { generateHash } from '#/shared/utils/generate-hash';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/client';
import uuid from '#/shared/utils/uuid.util';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import { useLiveQuery } from 'dexie-react-hooks';
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
  // setFlashcards: (flashcards: Flashcard[]) => void;
  addFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  removeFlashcards: (flashcards: Flashcard[]) => void;
  updateFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  updateFlashcard: (flashcard: Partial<Flashcard>) => void;
  assignFlashcardsToSet: (flashcardUuids: string[], setUuid: string) => void;
  // setSets: (sets: FlashcardSet[]) => void;
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
  // setFlashcards: () => null,
  addFlashcards: () => null,
  removeFlashcards: () => null,
  updateFlashcards: () => null,
  updateFlashcard: () => null,
  assignFlashcardsToSet: () => null,
  // setSets: () => null,
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
    type: 'index',
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
    tags: [],
    synced: false,
  } as Omit<Flashcard, 'frontUuid' | 'order'>;

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
    synced: false,
  } as FlashcardSet;

  const defaultMetadata = DEFAULT_METADATA;

  /////////////////
  // #endregion DEFAULTS
  /////////////////

  /////////////////
  // #region EXTERNAL HOOKS
  /////////////////

  // const { fetch } = useFetch();
  const { isLoggedIn, user } = useSessionContext();
  const supabase = createClient();

  /////////////////
  // #endregion EXTERNAL HOOKS
  /////////////////

  /////////////////
  // #region STATE
  /////////////////

  const [avatarSeed, setAvatarSeed] = useState<string>('');
  // const [migration, setMigration] = useState<{
  //   flashcards: string | null;
  //   sets: string | null;
  // }>({ flashcards: null, sets: null });
  // const [appVersion, setAppVersion] = useState<string>('');
  const flashcardsArray = useLiveQuery(() => db.flashcards.toArray()) ?? [];
  const setsArray = useLiveQuery(() => db.sets.toArray()) ?? [];
  const metadata =
    useLiveQuery(() => db.metadata.get('current')) ??
    ({
      ...DEFAULT_METADATA,
    } as Metadata);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const [setsDictionary, setSetsDictionary] = useState<
    DictionaryValue<string>[]
  >([]);
  // const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
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

  // useLocalStorage({
  //   key: 'flashcards',
  //   defaultValue: FLASHCARDS_LOCAL_STORAGE_INIT,
  //   setArrayValue: setFlashcardsArray,
  // });
  // useLocalStorage({
  //   key: 'sets',
  //   defaultValue: SETS_LOCAL_STORAGE_INIT,
  //   setArrayValue: setSetsArray,
  // });
  // useLocalStorage({
  //   key: 'metadata',
  //   defaultValue: DEFAULT_METADATA,
  //   setValue: setMetadata,
  // });
  useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
    setValue: setTheme,
  });
  // useLocalStorage({
  //   key: 'appVersion',
  //   defaultValue: '1.0.1',
  //   setValue: setAppVersion,
  // });
  // useLocalStorage({
  //   key: 'migrations',
  //   defaultValue: { flashcards: '', sets: '' },
  //   setValue: setMigration,
  // });

  /////////////////
  // #endregion LOCAL STORAGE
  /////////////////

  /////////////////
  // #region FLASHCARDS MANAGEMENT
  /////////////////

  // const setFlashcards = (flashcards: Flashcard[]) => {
  //   const flashcardsObject: Record<string, Flashcard> = {};

  //   flashcards.forEach((item: Flashcard) => {
  //     flashcardsObject[item.frontUuid] = item;
  //   });
  //   localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
  //   setFlashcardsArray(flashcards);
  // };

  const addFlashcards = async (flashcards: Partial<Flashcard>[]) => {
    const mappedFlashcards: Flashcard[] = flashcards.map((flashcard, index) => {
      const flashcardUuid = flashcard.frontUuid ?? uuid();
      return flashcardsMerge(defaultFlashcard, {
        ...flashcard,
        frontUuid: flashcardUuid,
        order: flashcardsArray.length + index,
      });
    });

    db.flashcards.bulkAdd(mappedFlashcards);

    const bulkFlashcards = await db.flashcards.bulkGet(
      mappedFlashcards.map((item) => item.frontUuid),
    );

    await supabase.from('flashcards').insert(
      bulkFlashcards.map((item) => ({
        ...item,
        user_uuid: user?.id,
      })),
    );
  };

  // TODO: fix websockets
  // const addFlashcardsFromWebsocket = (flashcard: Flashcard) => {
  //   setFlashcardsArray((prev) => {
  //     const exists = prev.some(
  //       (item) => item.frontUuid === flashcard.frontUuid,
  //     );

  //     if (exists) {
  //       return prev;
  //     } else {
  //       const array = [...prev, flashcard].map((item, index) => ({
  //         ...item,
  //         order: index,
  //       }));
  //       const object: Record<string, Flashcard> = {};
  //       array.forEach((item) => {
  //         object[item.frontUuid] = item;
  //       });
  //       localStorage.setItem('flashcards', JSON.stringify(object));
  //       return array;
  //     }
  //   });
  // };

  const removeFlashcards = async (flashcards: Flashcard[]) => {
    const flashcardsToDelete: string[] = flashcards.map(
      (item) => item.frontUuid,
    );

    db.flashcards.bulkDelete(flashcardsToDelete);
    db.sets
      .where('flashcards')
      .anyOf(flashcardsToDelete)
      .modify((set) => {
        set.flashcards = set.flashcards.filter(
          (uuid) => !flashcardsToDelete.includes(uuid),
        );
      });

    // It wont work on listening to postgres msg's
    // I need to broadcast messages to other subscribers here.
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsToDelete);

    await websocketChannel.current?.send({
      type: 'broadcast',
      event: 'flashcards_delete',
      payload: { flashcards: flashcardsToDelete },
    });
  };

  // const removeFlashcardsByUuid = async (uuids: string[]) => {
  //   db.flashcards.bulkDelete(uuids);
  // };

  const updateFlashcards = async (flashcards: Partial<Flashcard>[]) => {
    const mappedFlashcards: Flashcard[] = flashcards.map((flashcard) =>
      flashcardsMerge(defaultFlashcard, flashcard),
    );

    db.flashcards.bulkPut(mappedFlashcards);

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
    const updatedFlashcard: Flashcard = flashcardsMerge(
      defaultFlashcard,
      flashcard,
    );

    db.flashcards.put(updatedFlashcard);

    await supabase
      .from('flashcards')
      .update(updatedFlashcard)
      .eq('frontUuid', flashcard.frontUuid);
  };

  // const updateFlashcardsFromWebsocket = (flashcard: Flashcard) => {
  //   setFlashcardsArray((prev) => {
  //     const updatedFlashcards = prev.map((item) => {
  //       if (item.frontUuid === flashcard.frontUuid) {
  //         return flashcard;
  //       }
  //       return item;
  //     });
  //     const object: Record<string, Flashcard> = {};
  //     updatedFlashcards.forEach((item) => {
  //       object[item.frontUuid] = item;
  //     });
  //     localStorage.setItem('flashcards', JSON.stringify(object));
  //     return updatedFlashcards;
  //   });
  // };

  const assignFlashcardsToSet = async (
    flashcardUuids: string[],
    setUuid: string,
  ) => {
    const set = await db.sets.get(setUuid);
    const flashcards = await db.flashcards.bulkGet(flashcardUuids);

    if (!set) {
      console.warn('Set not found');
      return;
    }

    const newFlashcards = Array.from(
      new Set([...set.flashcards, ...flashcardUuids]),
    );

    await db.sets.update(setUuid, {
      flashcards: newFlashcards,
    });
    await db.flashcards.bulkPut(
      flashcards.map((flashcard) => ({
        ...flashcard,
        sets: [...(flashcard?.sets ?? []), setUuid],
      })) as Flashcard[],
    );
  };

  // const removeSetsFromFlashcards = async (setUuids: string[]) => {
  //   await db.transaction('rw', db.flashcards, db.sets, async () => {
  //     // 1. Remove sets from flashcards
  //     await db.flashcards
  //       .where('sets')
  //       .equals(setUuids)
  //       .modify((flashcard) => {
  //         const originalLength = flashcard.sets?.length || 0;
  //         flashcard.sets =
  //           flashcard.sets?.filter((uuid) => !setUuids.includes(uuid)) || [];

  //         // Only update timestamp if actual modification occurred
  //         if (flashcard.sets.length !== originalLength) {
  //           flashcard.updatedAt = new Date().toISOString();
  //         }
  //       });
  //   });
  // };

  /////////////////
  // #endregion FLASHCARDS MANAGEMENT
  /////////////////

  /////////////////
  // #region SETS MANAGEMENT
  /////////////////

  const addSets = async (sets: Partial<FlashcardSet>[]) => {
    const mappedSets: FlashcardSet[] = sets.map((set) =>
      setsMerge(defaultSet, set),
    );

    db.sets.bulkAdd(mappedSets);

    await supabase
      .from('sets')
      .insert(mappedSets.map((item) => ({ ...item, user_uuid: user?.id })));
  };

  // const addSetsFromWebsocket = (set: FlashcardSet) => {
  //   setSetsArray((prev) => {
  //     const exists = prev.some((item) => item.frontUuid === set.frontUuid);

  //     if (exists) {
  //       return prev;
  //     } else {
  //       const array = [...prev, set];
  //       const object: Record<string, FlashcardSet> = {};

  //       array.forEach((item) => {
  //         object[item.frontUuid] = item;
  //       });

  //       localStorage.setItem('sets', JSON.stringify(object));
  //       return array;
  //     }
  //   });
  // };

  // const setSets = (sets: FlashcardSet[]) => {
  //   const setsObject: Record<string, FlashcardSet> = {};
  //   sets.forEach((item: FlashcardSet) => {
  //     setsObject[item.frontUuid] = item;
  //   });

  //   localStorage.setItem('sets', JSON.stringify(setsObject));
  //   setSetsArray(sets);
  // };

  const removeSets = async (sets: FlashcardSet[]) => {
    const setsToDelete: string[] = sets.map((item) => item.frontUuid);

    db.sets.bulkDelete(setsToDelete);
    db.flashcards
      .where('sets')
      .anyOf(setsToDelete)
      .modify((flashcard) => {
        flashcard.sets = flashcard.sets?.filter(
          (uuid) => !setsToDelete.includes(uuid),
        );
      });

    await supabase.from('sets').delete().in('frontUuid', setsToDelete);
    await websocketChannel.current?.send({
      type: 'broadcast',
      event: 'sets_delete',
      payload: { sets: setsToDelete },
    });
  };

  // const removeSetsByUuid = async (uuids: string[]) => {
  //   db.sets.bulkDelete(uuids);
  // };

  const updateSets = async (sets: Partial<FlashcardSet>[]) => {
    const mappedSets: FlashcardSet[] = sets.map((set) =>
      setsMerge(defaultSet, set),
    );

    db.sets.bulkPut(mappedSets);

    await Promise.all(
      mappedSets.map((set) =>
        supabase.from('sets').update(set).eq('frontUuid', set.frontUuid),
      ),
    );
  };

  const updateSet = async (set: Partial<FlashcardSet>) => {
    const updatedSet = setsMerge(defaultSet, set);

    db.sets.put(updatedSet);

    await supabase.from('sets').update(set).eq('frontUuid', set.frontUuid);
  };

  // const updateSetsFromWebsocket = (set: FlashcardSet) => {
  //   setSetsArray((prev) => {
  //     const updatedSets = prev.map((item) => {
  //       if (item.frontUuid === set.frontUuid) {
  //         return set;
  //       }
  //       return item;
  //     });
  //     const object: Record<string, FlashcardSet> = {};

  //     updatedSets.forEach((item) => {
  //       object[item.frontUuid] = item;
  //     });

  //     localStorage.setItem('sets', JSON.stringify(object));
  //     return updatedSets;
  //   });
  // };

  /////////////////
  // #endregion SETS MANAGEMENT
  /////////////////

  /////////////////
  // #region STATS MANAGEMENT
  /////////////////

  const updateMetadata = (update: Partial<Metadata>) => {
    const updatedMetadata = metadataMerge(defaultMetadata, update);

    db.metadata.update('current', updatedMetadata);
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
        async (payload) => {
          if (payload.new) {
            const updatedFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            await db.flashcards.put(
              omit(updatedFlashcard, ['user_uuid', 'id']) as Flashcard,
            );
          }
        },
      )

      // // FLASHCARDS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flashcards' },
        async (payload) => {
          if (payload.new) {
            const newFlashcard = payload.new as Flashcard & {
              user_uuid: string;
              id: string;
            };
            await db.flashcards.put(
              omit(newFlashcard, ['user_uuid', 'id']) as Flashcard,
            );
          }
        },
      )
      // FLASHCARDS - DELETE
      .on('broadcast', { event: 'flashcards_delete' }, async ({ payload }) => {
        if (
          payload.flashcards &&
          payload.flashcards.length >= 0 &&
          Array.isArray(payload.flashcards)
        ) {
          await db.flashcards.bulkDelete(payload.flashcards);
        }
      })

      // SETS - UPDATE
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sets' },
        async (payload) => {
          if (payload.new) {
            const updatedSet = payload.new as FlashcardSet & {
              user_uuid: string;
              id: string;
            };
            await db.sets.put(
              omit(updatedSet, ['user_uuid', 'id']) as FlashcardSet,
            );
          }
        },
      )

      // SETS - INSERT
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sets' },
        async (payload) => {
          if (payload.new) {
            const newSet = payload.new as FlashcardSet & {
              user_uuid: string;
              id: string;
            };
            await db.sets.put(
              omit(newSet, ['user_uuid', 'id']) as FlashcardSet,
            );
          }
        },
      )

      // SETS - DELETE
      .on('broadcast', { event: 'sets_delete' }, async ({ payload }) => {
        if (
          payload?.sets &&
          payload?.sets.length >= 0 &&
          Array.isArray(payload?.sets)
        ) {
          await db.sets.bulkDelete(payload?.sets);
        }
      })
      .subscribe();
  };

  const syncLocalToRemote = async () => {
    if (!isLoggedIn || user === null) return;

    const unsyncedFlashcards = (await db.flashcards.toArray())
      .filter((card) => !card.synced)
      .map((card) => ({ ...card, synced: true, user_uuid: user.id }));

    const { error } = await supabase
      .from('flashcards')
      .upsert(unsyncedFlashcards);

    console.log(error);

    if (error) {
      await db.flashcards
        .where('frontUuid')
        .anyOf(unsyncedFlashcards.map((c) => c.frontUuid))
        .modify({ synced: true });
    }
  };

  const syncRemoteToLocal = async () => {
    if (!isLoggedIn || user === null) return;

    const metadata = await db.metadata.get('current');
    const newLastSyncAt = new Date().toISOString();
    let lastSyncAt: string;

    if (
      !metadata ||
      !metadata.lastSyncAt ||
      isNaN(new Date(metadata.lastSyncAt).getTime())
    ) {
      // First sync or invalid date: use epoch
      lastSyncAt = new Date(0).toISOString();
    } else {
      // Valid date: use ISO string
      lastSyncAt = new Date(metadata.lastSyncAt).toISOString();
    }

    // Fetch changes from Supabase
    const { data: remoteFlashcards, error } = await supabase
      .from('flashcards')
      .select(
        'frontUuid, type, tags, createdAt, updatedAt, sets, examples, keyPoints, synonyms, relatedFacts, spacedRepetition, synced, context, query, definition, order',
      )
      .gt('updatedAt', lastSyncAt);

    if (!error && remoteFlashcards) {
      // Upsert into IndexedDB
      await db.flashcards.bulkPut(remoteFlashcards as Flashcard[]);
    }

    await db.metadata.update('current', {
      lastSyncAt: new Date(newLastSyncAt),
    });
  };

  const syncWithDB = async () => {
    // LOCAL TO REMOTE
    if (!isLoggedIn || user === null) return;

    await syncLocalToRemote();

    // REMOTE TO LOCAL

    await syncRemoteToLocal();
    //   const newLastSyncAt = new Date();
    //   const oldLastSyncAt = metadata.lastSyncAt;

    //   const fetchFlashcards: Promise<ApiResponse<ApiFlashcardsSyncResponse>> =
    //     fetch(API_ROUTES.SYNC_FLASH_CARDS, {
    //       method: 'POST',
    //       body: JSON.stringify({
    //         flashcards: flashcardsArray,
    //         lastSyncAt: oldLastSyncAt,
    //       }),
    //     });

    //   const fetchSets: Promise<ApiResponse<ApiSetsSyncResponse>> = fetch(
    //     API_ROUTES.SYNC_SETS,
    //     {
    //       method: 'POST',
    //       body: JSON.stringify({
    //         sets: setsArray,
    //         lastSyncAt: oldLastSyncAt,
    //       }),
    //     },
    //   );

    //   const fetchMetadata: Promise<ApiResponse<ApiMetadataSyncResponse>> = fetch(
    //     API_ROUTES.SYNC_METADATA,
    //     {
    //       method: 'POST',
    //       body: JSON.stringify({
    //         metadata: metadata,
    //         theme: theme,
    //         newLastSyncAt: newLastSyncAt,
    //       }),
    //     },
    //   );

    //   const responses = await Promise.allSettled([
    //     fetchMetadata,
    //     fetchFlashcards,
    //     fetchSets,
    //   ]);

    //   responses.forEach((response) => {
    //     if (response.status === 'fulfilled') {
    //       if (response.value.success) {
    //         const value = response.value?.data;

    //         if ('flashcards' in value) {
    //           setFlashcardsArray(value.flashcards);
    //           const flashcardsObject: Record<string, Flashcard> = {};

    //           value.flashcards.forEach((item: Flashcard) => {
    //             flashcardsObject[item.frontUuid] = item;
    //           });

    //           localStorage.setItem(
    //             'flashcards',
    //             JSON.stringify(flashcardsObject),
    //           );
    //         } else if ('sets' in value) {
    //           setSetsArray(value?.sets);
    //           const setsObject: Record<string, FlashcardSet> = {};

    //           value?.sets?.forEach((item: FlashcardSet) => {
    //             setsObject[item.frontUuid] = item;
    //           });

    //           localStorage.setItem('sets', JSON.stringify(setsObject));
    //         } else if ('metadata' in value) {
    //           setMetadata(value.metadata);
    //           setTheme(value.theme);

    //           localStorage.setItem('metadata', JSON.stringify(value.metadata));
    //           localStorage.setItem('theme', JSON.stringify(value.theme));
    //         }
    //       }

    //       return;
    //     }
    //     console.error(response.reason);
    //   });

    await applyWebsockets();
  };

  /////////////////
  // #endregion SYNCHRONIZATION
  /////////////////

  /////////////////
  // #region MIGRATION
  /////////////////

  // const migrateFlashcards = () => {
  //   if (!appVersion) return;
  //   if (
  //     migration.flashcards === null ||
  //     isNewerVersion(migration.flashcards, '1.0.0')
  //   ) {
  //     setFlashcardsArray((prev) => {
  //       const flashcardsObject: Record<string, Flashcard> = {};
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const unknownFlashcards = prev as any[];

  //       const updatedFlashcards = unknownFlashcards.map((flashcard) => {
  //         const migratedFlashcard = {
  //           type: flashcard?.type ?? ('index' as FlashcardType),
  //           frontUuid: flashcard?.frontUuid ?? uuid(),
  //           question: flashcard?.question ?? defaultFlashcard.query,
  //           questionAddition:
  //             flashcard?.questionAddition ?? defaultFlashcard.context,
  //           answer: flashcard?.answer ?? defaultFlashcard.definition,
  //           order: flashcard?.order ?? flashcardsArray.length + 1,
  //           createdAt: flashcard?.createdAt ?? new Date().toISOString(),
  //           updatedAt: new Date().toISOString(),
  //           spacedRepetition: {
  //             interval:
  //               flashcard?.spacedRepetition?.interval ??
  //               defaultFlashcard.spacedRepetition.interval,
  //             easeFactor:
  //               flashcard?.spacedRepetition?.easeFactor ??
  //               defaultFlashcard.spacedRepetition.easeFactor,
  //             reviews:
  //               flashcard?.spacedRepetition?.reviews ??
  //               defaultFlashcard.spacedRepetition.reviews,
  //             lastReviewAt:
  //               flashcard?.spacedRepetition?.lastReviewAt ??
  //               defaultFlashcard.spacedRepetition.lastReviewAt,
  //             dueDate:
  //               flashcard?.spacedRepetition?.dueDate ??
  //               defaultFlashcard.spacedRepetition.dueDate,
  //           },
  //           sets: flashcard?.sets ?? [],
  //         };

  //         flashcardsObject[migratedFlashcard.frontUuid] =
  //           migratedFlashcard as unknown as Flashcard;
  //         return migratedFlashcard as unknown as Flashcard;
  //       });

  //       localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
  //       setMigration((prev) => {
  //         localStorage.setItem(
  //           'migrations',
  //           JSON.stringify({ ...prev, flashcards: '1.0.0' }),
  //         );

  //         return { ...prev, flashcards: '1.0.0' };
  //       });
  //       return updatedFlashcards;
  //     });
  //   } else if (
  //     migration.flashcards !== null &&
  //     isNewerVersion(migration.flashcards, '1.0.1')
  //   ) {
  //     setFlashcardsArray((prev) => {
  //       console.log('prev', prev);
  //       const flashcardsObject: Record<string, Flashcard> = {};
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const unknownFlashcards = prev as any[];

  //       const updatedFlashcards = unknownFlashcards.map((flashcard) => {
  //         const migratedFlashcard: Flashcard = {
  //           type: flashcard?.type ?? ('index' as FlashcardType),
  //           frontUuid: flashcard?.frontUuid ?? uuid(),
  //           query: flashcard?.question ?? defaultFlashcard.query,
  //           context: flashcard?.questionAddition ?? defaultFlashcard.context,
  //           definition: flashcard?.answer ?? defaultFlashcard.definition,
  //           order: flashcard?.order ?? flashcardsArray.length + 1,
  //           createdAt: flashcard?.createdAt ?? new Date().toISOString(),
  //           updatedAt: new Date().toISOString(),
  //           spacedRepetition: {
  //             interval:
  //               flashcard?.spacedRepetition?.interval ??
  //               defaultFlashcard.spacedRepetition.interval,
  //             easeFactor:
  //               flashcard?.spacedRepetition?.easeFactor ??
  //               defaultFlashcard.spacedRepetition.easeFactor,
  //             reviews:
  //               flashcard?.spacedRepetition?.reviews ??
  //               defaultFlashcard.spacedRepetition.reviews,
  //             lastReviewAt:
  //               flashcard?.spacedRepetition?.lastReviewAt ??
  //               defaultFlashcard.spacedRepetition.lastReviewAt,
  //             dueDate:
  //               flashcard?.spacedRepetition?.dueDate ??
  //               defaultFlashcard.spacedRepetition.dueDate,
  //           },
  //           sets: flashcard?.sets ?? [],
  //           examples: flashcard?.examples ?? defaultFlashcard.examples,
  //           keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
  //           synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
  //           relatedFacts:
  //             flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
  //         };

  //         flashcardsObject[migratedFlashcard.frontUuid] = migratedFlashcard;
  //         return migratedFlashcard;
  //       });

  //       localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
  //       setMigration((prev) => {
  //         localStorage.setItem(
  //           'migrations',
  //           JSON.stringify({ ...prev, flashcards: '1.0.1' }),
  //         );

  //         return { ...prev, flashcards: '1.0.1' };
  //       });

  //       return updatedFlashcards;
  //     });
  //   }
  // };

  // const migrateSets = () => {
  //   if (!appVersion) return;
  //   if (migration.sets === null || isNewerVersion(migration.sets, '1.0.0')) {
  //     setSetsArray((prev) => {
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const unknownSets = prev as any[];
  //       const setsObject: Record<string, FlashcardSet> = {};
  //       const updatedSets = unknownSets.map((set) => {
  //         const setFlashcards = set?.flashcards ?? [];
  //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //         const updatedFlashcards = setFlashcards?.map((flashcard: any) => {
  //           if (typeof flashcard === 'string') {
  //             return flashcard;
  //           } else {
  //             return flashcard.frontUuid;
  //           }
  //         });
  //         const migratedSet: FlashcardSet = {
  //           frontUuid: set?.frontUuid ?? uuid(),
  //           name: set?.name ?? defaultSet.name,
  //           description: set?.description ?? defaultSet.description,
  //           category: set?.category ?? defaultSet.category,
  //           isFavourite: set?.isFavourite ?? defaultSet.isFavourite,
  //           createdAt: set?.createdAt ?? new Date().toISOString(),
  //           updatedAt: new Date().toISOString(),
  //           hardlink:
  //             set?.hardlink ??
  //             (set?.name as string)?.replace(/ /g, '-')?.toLowerCase() ??
  //             '',
  //           flashcards: updatedFlashcards,
  //         };

  //         setsObject[migratedSet.frontUuid] = migratedSet;
  //         return migratedSet;
  //       });

  //       localStorage.setItem('sets', JSON.stringify(setsObject));
  //       setMigration((prev) => {
  //         localStorage.setItem(
  //           'migrations',
  //           JSON.stringify({ ...prev, sets: '1.0.0' }),
  //         );

  //         return { ...prev, sets: '1.0.0' };
  //       });
  //       return updatedSets;
  //     });
  //   } else if (
  //     migration.sets !== null &&
  //     isNewerVersion(migration.sets, '1.0.1')
  //   ) {
  //     setSetsArray((prev) => {
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const unknownSets = prev as any[];
  //       const setsObject: Record<string, FlashcardSet> = {};
  //       const updatedSets = unknownSets.map((set) => {
  //         const migratedSet: FlashcardSet = {
  //           frontUuid: set?.frontUuid ?? uuid(),
  //           name: set?.name ?? defaultSet.name,
  //           description: set?.description ?? defaultSet.description,
  //           category: set?.category ?? defaultSet.category,
  //           isFavourite: set?.isFavourite ?? defaultSet.isFavourite,
  //           createdAt: set?.createdAt ?? new Date().toISOString(),
  //           updatedAt: new Date().toISOString(),
  //           hardlink:
  //             set?.hardlink ??
  //             (set?.name as string)?.replace(/ /g, '-')?.toLowerCase() ??
  //             '',
  //           flashcards: set?.flashCards ?? [],
  //         };

  //         setsObject[migratedSet.frontUuid] = migratedSet;
  //         return migratedSet;
  //       });

  //       localStorage.setItem('sets', JSON.stringify(setsObject));
  //       setMigration((prev) => {
  //         localStorage.setItem(
  //           'migrations',
  //           JSON.stringify({ ...prev, sets: '1.0.1' }),
  //         );

  //         return { ...prev, sets: '1.0.1' };
  //       });
  //       return updatedSets;
  //     });
  //   }
  // };

  const backupBeforeDixieMigration = () => {
    const backupAvailable = localStorage.getItem('backup_dexie') !== null;

    if (!backupAvailable) {
      const backup = {
        flashcards: JSON.parse(localStorage.getItem('flashcards') || '[]'),
        sets: JSON.parse(localStorage.getItem('sets') || '[]'),
        metadata: JSON.parse(localStorage.getItem('metadata') || '{}'),
      };
      localStorage.setItem('backup_pre_dexie', JSON.stringify(backup));
    }
  };

  const migrateLocalStorageToDexie = async () => {
    try {
      // 1. Check if migration already ran
      if (localStorage.getItem('dexie_migrated')) return;

      // 2. Validate localStorage data
      const parseWithDefault = (key: string) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      };

      const flashcards = Object.values(
        parseWithDefault('flashcards'),
      ) as Flashcard[];
      const sets = Object.values(parseWithDefault('sets')) as FlashcardSet[];
      const metadata = parseWithDefault('metadata');

      // 3. Use explicit Dexie transaction
      await db.transaction(
        'rw',
        db.flashcards,
        db.sets,
        db.metadata,
        async () => {
          // Clear existing data first
          await Promise.all([
            db.flashcards.clear(),
            db.sets.clear(),
            db.metadata.clear(),
          ]);

          // 4. Batch insert with validation
          if (flashcards.length > 0) {
            await db.flashcards.bulkPut(flashcards);
          }

          if (sets.length > 0) {
            await db.sets.bulkPut(sets);
          }

          if (metadata) {
            await db.metadata.put({ ...metadata, key: 'current' }, 'current');
          }

          // 5. Mark migration complete
          localStorage.setItem('dexie_migrated', 'true');
        },
      );

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      // Rollback mechanism
      localStorage.removeItem('dexie_migrated');
      throw error;
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

  // useEffect(() => {
  //   if (!appVersion) return;

  //   if (flashcardsArray.length > 0) {
  //     migrateFlashcards();
  //   }

  //   if (setsArray.length > 0) {
  //     migrateSets();
  //   }

  //   if (migration.flashcards === '1.0.1' && migration.sets === '1.0.1') {
  //     localStorage.setItem('appVersion', JSON.stringify('1.0.1'));
  //     setAppVersion('1.0.1');
  //   }
  // }, [
  //   appVersion,
  //   flashcardsArray,
  //   setsArray,
  //   migrateFlashcards,
  //   migrateSets,
  //   setFlashcardsArray,
  //   setSetsArray,
  // ]);

  useEffect(() => {
    setAvatarSeed(generateHash());
    backupBeforeDixieMigration();
    migrateLocalStorageToDexie();
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
        // setFlashcards: setFlashcards,
        addFlashcards: addFlashcards,
        removeFlashcards: removeFlashcards,
        updateFlashcards: updateFlashcards,
        updateFlashcard: updateFlashcard,
        assignFlashcardsToSet: assignFlashcardsToSet,
        // setSets,
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
