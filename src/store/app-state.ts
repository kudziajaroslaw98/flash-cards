import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard, FlashcardType } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import type { Reminder } from '#/types/reminder.type';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import type { User, UserAttributes } from '@supabase/supabase-js';

// ============================================================================
// Session Slice
// ============================================================================

export interface SessionSlice {
  // State
  user: User | null;
  isLoggedIn: boolean;
  pickedPlan: string | null;
  isPlanActive: boolean;

  // Actions
  setUser: (user: User | null) => void;
  logOut: () => Promise<void>;
  updateUser: (user: UserAttributes) => Promise<void>;
  deleteUser: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// ============================================================================
// Flashcards Slice
// ============================================================================

export interface FlashcardsSlice {
  // Static state
  flashcardTypeDictionaries: DictionaryValue<FlashcardType>[];

  // Actions (Dexie mutations)
  addFlashcards: (flashcards: Partial<Flashcard>[]) => Promise<void>;
  removeFlashcards: (flashcards: Flashcard[]) => Promise<void>;
  updateFlashcards: (flashcards: Partial<Flashcard>[]) => Promise<void>;
  updateFlashcard: (flashcard: Partial<Flashcard>) => Promise<void>;
  assignFlashcardsToSet: (
    flashcardUuids: string[],
    setUuid: string
  ) => Promise<void>;
  unassignFlashcardsFromSet: (
    flashcardUuids: string[],
    setUuid: string
  ) => Promise<void>;
}

// ============================================================================
// Sets Slice
// ============================================================================

export interface SetsSlice {
  // Actions (Dexie mutations)
  addSets: (sets: Partial<FlashcardSet>[]) => Promise<void>;
  removeSets: (sets: FlashcardSet[]) => Promise<void>;
  updateSet: (set: Partial<FlashcardSet>) => Promise<void>;
  updateSets: (sets: Partial<FlashcardSet>[]) => Promise<void>;
}

// ============================================================================
// Metadata Slice
// ============================================================================

export interface MetadataSlice {
  // State
  theme: 'dark' | 'light';
  avatarSeed: string;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setAvatarSeed: (seed: string) => void;
  updateMetadata: (metadata: Partial<Metadata>) => Promise<void>;
}

// ============================================================================
// Reminders Slice
// ============================================================================

export interface RemindersSlice {
  // Actions (Dexie mutations)
  addReminders: (reminders: Partial<Reminder>[]) => Promise<void>;
  removeReminders: (reminders: Reminder[]) => Promise<void>;
  updateReminders: (reminders: Partial<Reminder>[]) => Promise<void>;
}

// ============================================================================
// Study Plans Slice
// ============================================================================

export interface StudyPlansSlice {
  // Actions (Dexie mutations)
  removeStudyPlans: (plans: StudyPlan[]) => Promise<void>;
}

// ============================================================================
// Revise Plan Slice
// ============================================================================

export interface RevisePlanSlice {
  // State
  reviseStage: number;
  pickedStudyPlan: StudyPlan | null;
  currentDay: StudyDay | null;
  currentSession: StudySession | null;
  clicked: boolean;

  // Actions
  setReviseStage: (stage: number) => void;
  setPickedStudyPlan: (plan: StudyPlan | null) => void;
  setCurrentDay: (day: StudyDay | null) => void;
  setCurrentSession: (session: StudySession | null) => void;
  setClicked: (clicked: boolean) => void;
  updateReviseStage: (stage: number) => Promise<void>;
}

// ============================================================================
// Sync Slice
// ============================================================================

export interface SyncSlice {
  // State
  isSyncing: boolean;
  lastSyncAt: Date | null;

  // Actions
  syncLocalToRemote: () => Promise<void>;
  syncRemoteToLocal: () => Promise<void>;
  syncWithDB: () => Promise<void>;
  initializeWebsockets: () => Promise<void>;
  cleanupWebsockets: () => void;
}

// ============================================================================
// Combined App State
// ============================================================================

export interface AppState
  extends SessionSlice,
    FlashcardsSlice,
    SetsSlice,
    MetadataSlice,
    RemindersSlice,
    StudyPlansSlice,
    RevisePlanSlice,
    SyncSlice {}
