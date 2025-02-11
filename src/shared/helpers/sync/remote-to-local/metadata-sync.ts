import { db } from '#/db/dexie.db';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import type { Metadata } from '#/types/metadata.type';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function remoteToLocalMetadataSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
  emptyMetadata: boolean,
  metadata?: Metadata,
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
    } else if (error && !data) {
      // When metadata is empty, insert default metadata
      await db.metadata.put({
        ...defaultMetadata,
        key: 'current',
      } as unknown as Metadata);
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
    } else if (!data && metadata) {
      // When metadata is empty, insert metadata to supabase
      await supabase.from('metadata').insert({ ...metadata });
    }
  }
}
