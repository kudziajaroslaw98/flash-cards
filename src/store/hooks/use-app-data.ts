'use client';

import { db } from '#/db/dexie.db';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { Metadata } from '#/types/metadata.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import useAppStore from '../app-store';

/**
 * Hook that provides reactive data from Dexie (via useLiveQuery)
 * Use this for reading data that needs to reactively update
 */
export function useFlashcardsData() {
  const flashcardsArray =
    useLiveQuery(() => db.flashcards.toCollection().sortBy('createdAt')) ?? [];

  return useMemo(
    () => flashcardsArray.sort((a, b) => a.order - b.order),
    [flashcardsArray]
  );
}

export function useSetsData() {
  const setsArray = useLiveQuery(() => db.sets.toArray()) ?? [];
  return setsArray;
}

export function useSetsDictionary() {
  const setsArray = useSetsData();
  return useMemo(() => {
    return setsArray.map((set) => ({
      value: set.frontUuid,
      label: set.name,
    }));
  }, [setsArray]);
}

export function useCategories() {
  const setsArray = useSetsData();
  return useMemo(() => {
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
}

export function useRemindersData() {
  const remindersArray =
    useLiveQuery(() => db.reminders.toCollection().sortBy('createdAt')) ?? [];
  return remindersArray;
}

export function useMetadataData(): Metadata {
  const metadata =
    useLiveQuery(() => db.metadata.get('current')) ??
    ({
      ...defaultMetadata,
    } as Metadata);
  return metadata;
}

/**
 * Hook that provides store actions from Zustand
 * Use this for mutations/actions
 */
export function useAppActions() {
  return useAppStore(
    useShallow((state) => ({
      // Flashcard actions
      addFlashcards: state.addFlashcards,
      removeFlashcards: state.removeFlashcards,
      updateFlashcards: state.updateFlashcards,
      updateFlashcard: state.updateFlashcard,
      assignFlashcardsToSet: state.assignFlashcardsToSet,
      unassignFlashcardsFromSet: state.unassignFlashcardsFromSet,
      flashcardTypeDictionaries: state.flashcardTypeDictionaries,

      // Set actions
      addSets: state.addSets,
      removeSets: state.removeSets,
      updateSet: state.updateSet,
      updateSets: state.updateSets,

      // Metadata actions
      theme: state.theme,
      avatarSeed: state.avatarSeed,
      setTheme: state.setTheme,
      setAvatarSeed: state.setAvatarSeed,
      updateMetadata: state.updateMetadata,

      // Reminder actions
      addReminders: state.addReminders,
      removeReminders: state.removeReminders,
      updateReminders: state.updateReminders,

      // Study plan actions
      removeStudyPlans: state.removeStudyPlans,

      // Sync actions
      syncWithDB: state.syncWithDB,
      cleanupWebsockets: state.cleanupWebsockets,
    }))
  );
}

export function useSessionData() {
  return useAppStore(
    useShallow((state) => ({
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      pickedPlan: state.pickedPlan,
      isPlanActive: state.isPlanActive,
      logOut: state.logOut,
      updateUser: state.updateUser,
      deleteUser: state.deleteUser,
      checkSession: state.checkSession,
      setUser: state.setUser,
    }))
  );
}

export function useRevisePlanData() {
  return useAppStore(
    useShallow((state) => ({
      reviseStage: state.reviseStage,
      pickedStudyPlan: state.pickedStudyPlan,
      currentDay: state.currentDay,
      currentSession: state.currentSession,
      clicked: state.clicked,
      setReviseStage: state.setReviseStage,
      setPickedStudyPlan: state.setPickedStudyPlan,
      setCurrentDay: state.setCurrentDay,
      setCurrentSession: state.setCurrentSession,
      setClicked: state.setClicked,
      updateReviseStage: state.updateReviseStage,
    }))
  );
}

// Revise plan Dexie queries
export function useStudyPlansData() {
  return useLiveQuery(() => db.studyPlans.toArray()) ?? [];
}

export function useStudySessionData(planId: string | undefined) {
  return useLiveQuery(
    () =>
      planId
        ? db.studySessions.where('planId').equals(planId).first()
        : undefined,
    [planId]
  );
}

export function useStudyDaysData(planId: string | undefined) {
  return (
    useLiveQuery(
      () =>
        planId
          ? db.studyDays.where('planId').equals(planId).toArray()
          : [],
      [planId]
    ) ?? []
  );
}

export function useReviewFlashcardsData(cardIds: string[] | undefined) {
  return (
    useLiveQuery(() => {
      if (!cardIds || cardIds.length === 0) {
        return [];
      }
      return db.flashcards.where('frontUuid').anyOf(cardIds).toArray();
    }, [cardIds]) ?? []
  );
}

export function useNewFlashcardsData(cardIds: string[] | undefined) {
  return (
    useLiveQuery(() => {
      if (!cardIds || cardIds.length === 0) {
        return [];
      }
      return db.flashcards.where('frontUuid').anyOf(cardIds).toArray();
    }, [cardIds]) ?? []
  );
}

export function useCompletedFlashcardsData(cardIds: string[] | undefined) {
  return (
    useLiveQuery(() => {
      if (!cardIds || cardIds.length === 0) {
        return [];
      }
      return db.flashcards.where('frontUuid').anyOf(cardIds).toArray();
    }, [cardIds]) ?? []
  );
}
