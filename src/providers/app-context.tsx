import { db } from '#/db/dexie.db';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { defaultReminder } from '#/shared/defaults/default-reminder';
import { defaultSet } from '#/shared/defaults/default-set';
import { FLASHCARDS_DB_DEFAULT } from '#/shared/defaults/flashcards-local-storage-init';
import { SETS_DB_DEFAULT } from '#/shared/defaults/sets-local-storage-init';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { metadataMerge } from '#/shared/helpers/metadata-merge';
import { remindersMerge } from '#/shared/helpers/reminders-merge';
import { setsMerge } from '#/shared/helpers/sets-merge';
import { localToRemoteDailyStatsSync } from '#/shared/helpers/sync/local-to-remote/daily-stats-sync';
import { localToRemoteFlashcardsSync } from '#/shared/helpers/sync/local-to-remote/flashcards-sync';
import { localToRemoteFocusSessionsSync } from '#/shared/helpers/sync/local-to-remote/focus-sessions-sync';
import { localToRemoteMetadataSync } from '#/shared/helpers/sync/local-to-remote/metadata-sync';
import { localToRemoteRemindersSync } from '#/shared/helpers/sync/local-to-remote/reminders-sync';
import { localToRemoteReviewLogsSync } from '#/shared/helpers/sync/local-to-remote/review-logs-sync';
import { localToRemoteSetsSync } from '#/shared/helpers/sync/local-to-remote/sets-sync';
import { remoteToLocalDailyStatsSync } from '#/shared/helpers/sync/remote-to-local/daily-stats-sync';
import { remoteToLocalFlashcardsSync } from '#/shared/helpers/sync/remote-to-local/flashcards-sync';
import { remoteToLocalFocusSessionsSync } from '#/shared/helpers/sync/remote-to-local/focus-sessions-sync';
import { remoteToLocalMetadataSync } from '#/shared/helpers/sync/remote-to-local/metadata-sync';
import { remoteToLocalRemindersSync } from '#/shared/helpers/sync/remote-to-local/reminders-sync';
import { remoteToLocalReviewLogsSync } from '#/shared/helpers/sync/remote-to-local/review-logs-sync';
import { remoteToLocalSetsSync } from '#/shared/helpers/sync/remote-to-local/sets-sync';
import { generateHash } from '#/shared/utils/generate-hash';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/client';
import uuid from '#/shared/utils/uuid.util';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import type { Reminder } from '#/types/reminder.type';
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
  reminders: Reminder[];
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
  addReminders: (reminders: Partial<Reminder>[]) => void;
  removeReminders: (reminders: Reminder[]) => void;
  updateReminders: (reminders: Partial<Reminder>[]) => void;
};

export const AppContext = createContext<AppContextType>({
  flashcards: [],
  reminders: [],
  sets: [],
  setsDictionary: [],
  categories: [],
  metadata: defaultMetadata,
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
  addReminders: () => null,
  removeReminders: () => null,
  updateReminders: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
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
  const flashcardsArray =
    useLiveQuery(() => db.flashcards.toCollection().sortBy('order')) ?? [];
  const setsArray = useLiveQuery(() => db.sets.toArray()) ?? [];
  const remindersArray =
    useLiveQuery(() => db.reminders.toCollection().sortBy('createdAt')) ?? [];
  const metadata =
    useLiveQuery(() => db.metadata.get('current')) ??
    ({
      ...defaultMetadata,
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
  // #region REMINDERS MANAGEMENT
  /////////////////

  const addReminders = async (reminders: Partial<Reminder>[]) => {
    const mappedReminders: Reminder[] = reminders.map((reminder) =>
      remindersMerge(defaultReminder, reminder),
    );

    await db.reminders.bulkAdd(mappedReminders);

    const bulkReminders = await db.reminders.bulkGet(
      mappedReminders.map((item) => item.frontUuid),
    );

    const { error } = await supabase.from('reminders').insert(
      bulkReminders.map((item) => ({
        ...item,
        user_uuid: user?.id,
      })),
    );

    console.log(bulkReminders, error);
  };

  const removeReminders = async (reminders: Reminder[]) => {
    const remindersToDelete: string[] = reminders.map((item) => item.frontUuid);

    await db.reminders.bulkDelete(remindersToDelete);

    await supabase
      .from('reminders')
      .delete()
      .in('frontUuid', remindersToDelete);
  };

  const updateReminders = async (reminders: Partial<Reminder>[]) => {
    const mappedReminders: Reminder[] = reminders.map((reminder) =>
      remindersMerge(defaultReminder, reminder),
    );

    await db.reminders.bulkPut(mappedReminders);

    await Promise.all(
      mappedReminders.map((reminder) =>
        supabase
          .from('reminders')
          .update(reminder)
          .eq('frontUuid', reminder.frontUuid),
      ),
    );
  };

  /////////////////
  // #endregion REMINDERS MANAGEMENT
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

    await Promise.allSettled([
      // FLASHCARDS
      localToRemoteFlashcardsSync(supabase, user),

      // SETS
      localToRemoteSetsSync(supabase, user),

      // METADATA
      localToRemoteMetadataSync(supabase, user),

      // FOCUS SESSIONS
      localToRemoteFocusSessionsSync(supabase, user),

      // DAILY STATS
      localToRemoteDailyStatsSync(supabase, user),

      // REMINDERS
      localToRemoteRemindersSync(supabase, user),
    ]);
    // REVIEW LOGS
    await localToRemoteReviewLogsSync(supabase, user);
  };

  const syncRemoteToLocal = async () => {
    if (!isLoggedIn || user === null) return;

    const metadata = await db.metadata.get('current');
    const newLastSyncAt = new Date().toUTCString();
    const emptyMetadata = !metadata;
    let lastSyncAt: string;

    if (
      !metadata ||
      !metadata.lastSyncAt ||
      isNaN(new Date(metadata.lastSyncAt).getTime())
    ) {
      // First sync or invalid date: use epoch
      lastSyncAt = new Date(0).toUTCString();
    } else {
      // Valid date: use ISO string
      lastSyncAt = new Date(metadata.lastSyncAt).toUTCString();
    }

    await Promise.allSettled([
      // FLASHCARDS
      remoteToLocalFlashcardsSync(supabase, lastSyncAt),

      // SETS
      remoteToLocalSetsSync(supabase, lastSyncAt),

      // METADATA
      remoteToLocalMetadataSync(supabase, lastSyncAt, emptyMetadata, metadata),

      // FOCUS SESSIONS
      remoteToLocalFocusSessionsSync(supabase, lastSyncAt),

      // DAILY STATS
      remoteToLocalDailyStatsSync(supabase, lastSyncAt),

      // REMINDERS
      remoteToLocalRemindersSync(supabase, lastSyncAt),
    ]);
    // REVIEW LOGS
    await remoteToLocalReviewLogsSync(supabase, lastSyncAt);

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

  const migrateLocalStorageToDexie = async () => {
    try {
      // 1. Check if migration already ran
      if (localStorage.getItem('dexie_migrated')) return;
      localStorage.removeItem('flashcards');
      localStorage.removeItem('sets');
      localStorage.removeItem('metadata');
      localStorage.removeItem('appVersion');
      localStorage.removeItem('migrations');
      localStorage.removeItem('backup_pre_dexie');

      // 2. Validate localStorage data
      const flashcards = FLASHCARDS_DB_DEFAULT;
      const sets = SETS_DB_DEFAULT;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata = defaultMetadata as any;

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
          await db.flashcards.bulkPut(flashcards);
          await db.sets.bulkPut(sets);
          await db.metadata.put({ ...metadata, key: 'current' }, 'current');

          // 5. Mark migration complete
          localStorage.setItem('dexie_migrated', 'true');
        },
      );
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
        reminders: remindersArray,
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
        addReminders,
        removeReminders,
        updateReminders,
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
