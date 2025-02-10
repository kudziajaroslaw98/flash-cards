import { db } from '#/db/dexie.db';
import type { Flashcard } from '#/types/flash-card.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalFlashcardsSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
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
}
