import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteFlashcardsSync(
  supabase: SupabaseClient,
  user: User,
) {
  const unsyncedFlashcards = (await db.flashcards.toArray())
    .filter((card) => !card.synced)
    .map((card) => ({ ...card, synced: true, user_uuid: user.id }));

  const { error: flashcardError } = await supabase
    .from('flashcards')
    .upsert(unsyncedFlashcards, { onConflict: 'frontUuid' });

  if (!flashcardError) {
    await db.flashcards
      .where('frontUuid')
      .anyOf(unsyncedFlashcards.map((c) => c.frontUuid))
      .modify({ synced: true });
  }
}
