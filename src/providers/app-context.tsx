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
  useMemo,
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
  addFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  removeFlashcards: (flashcards: Flashcard[]) => void;
  updateFlashcards: (flashcards: Partial<Flashcard>[]) => void;
  updateFlashcard: (flashcard: Partial<Flashcard>) => void;
  assignFlashcardsToSet: (flashcardUuids: string[], setUuid: string) => void;
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
  addFlashcards: () => null,
  removeFlashcards: () => null,
  updateFlashcards: () => null,
  updateFlashcard: () => null,
  assignFlashcardsToSet: () => null,
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

  const { isLoggedIn, user } = useSessionContext();
  const supabase = createClient();

  /////////////////
  // #endregion EXTERNAL HOOKS
  /////////////////

  /////////////////
  // #region STATE
  /////////////////

  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const flashcardsArray = useLiveQuery(() => db.flashcards.toArray()) ?? [];
  const setsArray = useLiveQuery(() => db.sets.toArray()) ?? [];
  const metadata =
    useLiveQuery(() => db.metadata.get('current')) ??
    ({
      ...DEFAULT_METADATA,
    } as Metadata);
  const setsDictionary = useMemo(() => {
    return setsArray.map((set) => ({
      value: set.frontUuid,
      label: set.name,
    }));
  }, [setsArray]);
  const categories = useMemo(() => {
    const categoriesTmp = new Set<string>();
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

    return selectCategoriesAsDictionary;
  }, [setsArray]);
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

  /////////////////
  // #endregion SETS MANAGEMENT
  /////////////////

  /////////////////
  // #region STATS MANAGEMENT
  /////////////////

  const updateMetadata = async (update: Partial<Metadata>) => {
    const updatedMetadata = metadataMerge(defaultMetadata, update);

    await db.metadata.update('current', updatedMetadata);
    await supabase.from('metadata').update(updatedMetadata);
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
      .upsert(unsyncedFlashcards, { onConflict: 'frontUuid' });

    console.log('local -> remote', unsyncedFlashcards, error);

    if (!error) {
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

    console.log('remote -> local', remoteFlashcards, error);

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

    // WEB SOCKETS

    await applyWebsockets();
  };

  /////////////////
  // #endregion SYNCHRONIZATION
  /////////////////

  /////////////////
  // #region MIGRATION
  /////////////////

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
        addFlashcards: addFlashcards,
        removeFlashcards: removeFlashcards,
        updateFlashcards: updateFlashcards,
        updateFlashcard: updateFlashcard,
        assignFlashcardsToSet: assignFlashcardsToSet,
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
