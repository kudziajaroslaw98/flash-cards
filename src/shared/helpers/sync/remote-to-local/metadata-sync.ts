import { db } from '#/db/dexie.db';
import type { Metadata } from '#/types/metadata.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalMetadataSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
  emptyMetadata: boolean,
) {
  if (emptyMetadata) {
    const { data, error } = await supabase
      .from('metadata')
      .select(
        'answers, correctAnswers, incorrectAnswers, createdFlashCards, accuracy, streak, lastSyncAt, theme, synced, activeStudyPlan, notificationPermission, updatedAt',
      )
      .single();

    if (!error && data) {
      // Upsert into IndexedDB
      await db.metadata.put({ ...data, key: 'current' } as unknown as Metadata);
    }
  } else {
    const { data, error } = await supabase
      .from('metadata')
      .select(
        'answers, correctAnswers, incorrectAnswers, createdFlashCards, accuracy, streak, lastSyncAt, theme, synced, activeStudyPlan, notificationPermission, updatedAt',
      )
      .gt('updatedAt', lastSyncAt)
      .single();
    if (!error && data) {
      // Upsert into IndexedDB
      await db.metadata.put({ ...data, key: 'current' } as unknown as Metadata);
    }
  }
}
