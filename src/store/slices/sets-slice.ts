import { db } from '#/db/dexie.db';
import { defaultSet } from '#/shared/defaults/default-set';
import { setsMerge } from '#/shared/helpers/sets-merge';
import { createClient } from '#/shared/utils/supabase/client';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { StateCreator } from 'zustand';
import type { AppState, SetsSlice } from '../app-state';

export const createSetsSlice: StateCreator<AppState, [], [], SetsSlice> = (
  _set,
  get
) => ({
  // Actions
  addSets: async (sets) => {
    const supabase = createClient();
    const { user } = get();

    const mappedSets: FlashcardSet[] = sets.map((set) =>
      setsMerge(defaultSet, set)
    );

    await db.sets.bulkAdd(mappedSets);

    await supabase
      .from('sets')
      .insert(mappedSets.map((item) => ({ ...item, user_uuid: user?.id })));
  },

  removeSets: async (sets) => {
    const supabase = createClient();

    const setsToDelete: string[] = sets.map((item) => item.frontUuid);

    await db.sets.bulkDelete(setsToDelete);

    // Update flashcards that reference deleted sets
    await db.flashcards
      .where('sets')
      .anyOf(setsToDelete)
      .modify((flashcard) => {
        flashcard.sets = flashcard.sets?.filter(
          (uuid) => !setsToDelete.includes(uuid)
        );
      });

    await supabase.from('sets').delete().in('frontUuid', setsToDelete);
  },

  updateSets: async (sets) => {
    const supabase = createClient();

    const mappedSets: FlashcardSet[] = sets.map((set) =>
      setsMerge(defaultSet, set)
    );

    await db.sets.bulkPut(mappedSets);

    await Promise.all(
      mappedSets.map((set) =>
        supabase.from('sets').update(set).eq('frontUuid', set.frontUuid)
      )
    );
  },

  updateSet: async (set) => {
    const supabase = createClient();

    const updatedSet = setsMerge(defaultSet, set);

    await db.sets.put(updatedSet);

    await supabase.from('sets').update(set).eq('frontUuid', set.frontUuid);
  },
});
