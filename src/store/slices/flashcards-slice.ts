import { db } from '#/db/dexie.db';
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { createClient } from '#/shared/utils/supabase/client';
import uuid from '#/shared/utils/uuid.util';
import type { Flashcard } from '#/types/flash-card.type';
import type { StateCreator } from 'zustand';
import type { AppState, FlashcardsSlice } from '../app-state';

export const createFlashcardsSlice: StateCreator<
  AppState,
  [],
  [],
  FlashcardsSlice
> = (set, get) => ({
  // Static state
  flashcardTypeDictionaries: [
    { value: 'index', label: 'Index Flashcard' },
    { value: 'question', label: 'Question with answer' },
    { value: 'single', label: 'Detailed Flashcard' },
  ],

  // Actions
  addFlashcards: async (flashcards) => {
    const supabase = createClient();
    const { user } = get();

    // Get current flashcard count for ordering
    const currentCount = await db.flashcards.count();

    const mappedFlashcards: Flashcard[] = flashcards.map((flashcard, index) => {
      const flashcardUuid = flashcard.frontUuid ?? uuid();
      return flashcardsMerge(defaultFlashcard(), {
        ...flashcard,
        frontUuid: flashcardUuid,
        order: currentCount + index,
      });
    });

    await db.flashcards.bulkAdd(mappedFlashcards);

    const bulkFlashcards = await db.flashcards.bulkGet(
      mappedFlashcards.map((item) => item.frontUuid)
    );

    await supabase.from('flashcards').insert(
      bulkFlashcards.map((item) => ({
        ...item,
        user_uuid: user?.id,
      }))
    );

    // Update metadata
    const metadata = await db.metadata.get('current');
    if (metadata) {
      await db.metadata.put(
        {
          ...metadata,
          createdFlashCards: metadata.createdFlashCards + flashcards.length,
          updatedAt: new Date().toUTCString(),
        },
        'current'
      );
    }
  },

  removeFlashcards: async (flashcards) => {
    const supabase = createClient();

    const flashcardsToDelete: string[] = flashcards.map(
      (item) => item.frontUuid
    );

    await db.flashcards.bulkDelete(flashcardsToDelete);

    // Update sets that reference deleted flashcards
    await db.sets
      .where('flashcards')
      .anyOf(flashcardsToDelete)
      .modify((set) => {
        set.flashcards = set.flashcards.filter(
          (uuid) => !flashcardsToDelete.includes(uuid)
        );
      });

    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsToDelete);
  },

  updateFlashcards: async (flashcards) => {
    const supabase = createClient();

    const mappedFlashcards: Flashcard[] = flashcards.map((flashcard) =>
      flashcardsMerge(defaultFlashcard(), flashcard)
    );

    await db.flashcards.bulkPut(mappedFlashcards);

    await Promise.all(
      mappedFlashcards.map((flashcard) =>
        supabase
          .from('flashcards')
          .update(flashcard)
          .eq('frontUuid', flashcard.frontUuid)
      )
    );
  },

  updateFlashcard: async (flashcard) => {
    const supabase = createClient();

    const updatedFlashcard: Flashcard = flashcardsMerge(
      defaultFlashcard(),
      flashcard
    );

    await db.flashcards.put(updatedFlashcard);

    await supabase
      .from('flashcards')
      .update(updatedFlashcard)
      .eq('frontUuid', flashcard.frontUuid);
  },

  assignFlashcardsToSet: async (flashcardUuids, setUuid) => {
    const set = await db.sets.get(setUuid);

    if (!set) {
      console.warn('Set not found');
      return;
    }

    const currentlyAssignedUuids = set.flashcards;
    const newAssignmentUuids = new Set(flashcardUuids);
    const flashcardsToUnassignUuids = currentlyAssignedUuids.filter(
      (uuid) => !newAssignmentUuids.has(uuid)
    );

    await db.sets.update(setUuid, {
      flashcards: flashcardUuids,
    });

    const allRelevantUuids = [...flashcardUuids, ...flashcardsToUnassignUuids];
    const flashcardsToUpdate = await db.flashcards.bulkGet(allRelevantUuids);

    const bulkUpdateData = flashcardsToUpdate
      .map((flashcard) => {
        if (!flashcard) return null;

        const currentSets = new Set(flashcard.sets ?? []);

        if (newAssignmentUuids.has(flashcard.frontUuid)) {
          currentSets.add(setUuid);
        } else if (flashcardsToUnassignUuids.includes(flashcard.frontUuid)) {
          currentSets.delete(setUuid);
        }

        return {
          ...flashcard,
          sets: Array.from(currentSets),
        };
      })
      .filter(Boolean) as Flashcard[];

    if (bulkUpdateData.length > 0) {
      await db.flashcards.bulkPut(bulkUpdateData);
    }
  },

  unassignFlashcardsFromSet: async (flashcardUuids, setUuid) => {
    const set = await db.sets.get(setUuid);
    const flashcards = await db.flashcards.bulkGet(flashcardUuids);

    if (!set) {
      console.warn('Set not found');
      return;
    }

    await db.sets.update(setUuid, {
      flashcards: set.flashcards.filter(
        (flashcard) => !flashcardUuids.includes(flashcard)
      ),
    });

    await db.flashcards.bulkPut(
      flashcards.map((flashcard) => ({
        ...flashcard,
        sets: [...(flashcard?.sets ?? [])].filter((s) => s !== setUuid),
      })) as Flashcard[]
    );
  },
});
