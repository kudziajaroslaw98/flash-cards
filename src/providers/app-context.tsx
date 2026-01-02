'use client';

import { db } from '#/db/dexie.db';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { generateHash } from '#/shared/utils/generate-hash';
import useAppStore from '#/store/app-store';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import type { Reminder } from '#/types/reminder.type';
import type { StudyPlan } from '#/types/study-plan.type';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useShallow } from 'zustand/shallow';
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
  unassignFlashcardsFromSet: (
    flashcardUuids: string[],
    setUuid: string
  ) => void;
  addSets: (set: Partial<FlashcardSet>[]) => void;
  removeSets: (set: FlashcardSet[]) => void;
  updateSet: (set: Partial<FlashcardSet>) => void;
  updateSets: (sets: Partial<FlashcardSet>[]) => void;
  updateMetadata: (metadata: Partial<Metadata>) => void;
  addReminders: (reminders: Partial<Reminder>[]) => void;
  removeReminders: (reminders: Reminder[]) => void;
  updateReminders: (reminders: Partial<Reminder>[]) => void;
  removeStudyPlans: (plans: StudyPlan[]) => void;
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
  unassignFlashcardsFromSet: () => null,
  addSets: () => null,
  removeSets: () => null,
  updateSet: () => null,
  updateSets: () => null,
  updateMetadata: () => null,
  addReminders: () => null,
  removeReminders: () => null,
  updateReminders: () => null,
  removeStudyPlans: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
  const { isLoggedIn } = useSessionContext();

  // Get actions from Zustand store
  const {
    theme,
    avatarSeed,
    flashcardTypeDictionaries,
    setTheme,
    setAvatarSeed,
    addFlashcards,
    removeFlashcards,
    updateFlashcards,
    updateFlashcard,
    assignFlashcardsToSet,
    unassignFlashcardsFromSet,
    addSets,
    removeSets,
    updateSet,
    updateSets,
    updateMetadata,
    addReminders,
    removeReminders,
    updateReminders,
    removeStudyPlans,
    syncWithDB,
    cleanupWebsockets,
  } = useAppStore(
    useShallow((state) => ({
      theme: state.theme,
      avatarSeed: state.avatarSeed,
      flashcardTypeDictionaries: state.flashcardTypeDictionaries,
      setTheme: state.setTheme,
      setAvatarSeed: state.setAvatarSeed,
      addFlashcards: state.addFlashcards,
      removeFlashcards: state.removeFlashcards,
      updateFlashcards: state.updateFlashcards,
      updateFlashcard: state.updateFlashcard,
      assignFlashcardsToSet: state.assignFlashcardsToSet,
      unassignFlashcardsFromSet: state.unassignFlashcardsFromSet,
      addSets: state.addSets,
      removeSets: state.removeSets,
      updateSet: state.updateSet,
      updateSets: state.updateSets,
      updateMetadata: state.updateMetadata,
      addReminders: state.addReminders,
      removeReminders: state.removeReminders,
      updateReminders: state.updateReminders,
      removeStudyPlans: state.removeStudyPlans,
      syncWithDB: state.syncWithDB,
      cleanupWebsockets: state.cleanupWebsockets,
    }))
  );

  // Keep Dexie live queries for reactive data
  const flashcardsArray =
    useLiveQuery(() => db.flashcards.toCollection().sortBy('createdAt')) ?? [];
  const setsArray = useLiveQuery(() => db.sets.toArray()) ?? [];
  const remindersArray =
    useLiveQuery(() => db.reminders.toCollection().sortBy('createdAt')) ?? [];
  const metadata =
    useLiveQuery(() => db.metadata.get('current')) ??
    ({
      ...defaultMetadata,
    } as Metadata);

  // Derived state
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
      categoriesTmp
    ).map((item) => ({
      label: item,
      value: item,
    }));

    return selectCategoriesAsDictionary;
  }, [setsArray]);

  // Local storage for theme - wrapper to match Dispatch<SetStateAction<T>> signature
  const handleSetTheme = (value: React.SetStateAction<'dark' | 'light'>) => {
    if (typeof value === 'function') {
      const newValue = value(theme);
      setTheme(newValue);
    } else {
      setTheme(value);
    }
  };

  useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
    setValue: handleSetTheme,
  });

  // Migration from localStorage to Dexie
  const migrateLocalStorageToDexie = async () => {
    try {
      if (localStorage.getItem('dexie_migrated')) return;
      localStorage.removeItem('flashcards');
      localStorage.removeItem('sets');
      localStorage.removeItem('metadata');
      localStorage.removeItem('appVersion');
      localStorage.removeItem('migrations');
      localStorage.removeItem('backup_pre_dexie');

      await db.transaction(
        'rw',
        db.flashcards,
        db.sets,
        db.metadata,
        async () => {
          await Promise.all([
            db.flashcards.clear(),
            db.sets.clear(),
            db.metadata.clear(),
          ]);
          localStorage.setItem('dexie_migrated', 'true');
        }
      );
    } catch (error) {
      console.error('Migration failed:', error);
      localStorage.removeItem('dexie_migrated');
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    setAvatarSeed(generateHash());
    migrateLocalStorageToDexie();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    syncWithDB();

    return () => {
      cleanupWebsockets();
    };
  }, [isLoggedIn, syncWithDB, cleanupWebsockets]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const umamiBlocked = window.localStorage.getItem('umami.disabled');
      if (!umamiBlocked) {
        window.localStorage.setItem('umami.disabled', '1');
      }
    }
  }, []);

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
        addFlashcards,
        removeFlashcards,
        updateFlashcards,
        updateFlashcard,
        assignFlashcardsToSet,
        unassignFlashcardsFromSet,
        addSets,
        removeSets,
        updateSets,
        updateSet,
        updateMetadata,
        addReminders,
        removeReminders,
        updateReminders,
        removeStudyPlans,
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
