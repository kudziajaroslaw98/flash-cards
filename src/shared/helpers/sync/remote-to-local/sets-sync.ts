import { db } from '#/db/dexie.db';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalSetsSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('sets')
    .select(
      'frontUuid, name, description, isFavourite, category, hardlink,createdAt, updatedAt, flashcards, synced, reminders',
    )
    .gt('updatedAt', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.sets.bulkPut(data as FlashcardSet[]);
  }
}
