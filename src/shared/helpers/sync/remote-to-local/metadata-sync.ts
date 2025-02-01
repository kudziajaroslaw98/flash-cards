import { db } from '#/db/dexie.db';
import type { Metadata } from '#/types/metadata.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalMetadataSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
) {
  const { data, error } = await supabase
    .from('metadata')
    .select(
      'answers, correctAnswers, incorrectAnswers, createdFlashCards, accuracy, streak, lastSyncAt, theme, synced, activeStudyPlan, notificationPermission, updatedAt',
    )
    .gt('updatedAt', lastSyncAt);

  if (!error && data) {
    // Upsert into IndexedDB
    await db.metadata.put(data as unknown as Metadata, 'current');
  }
}
