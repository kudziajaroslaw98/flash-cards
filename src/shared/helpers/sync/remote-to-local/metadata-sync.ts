import { db } from '#/db/dexie.db';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import type { Metadata } from '#/types/metadata.type';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function remoteToLocalMetadataSync(
  supabase: SupabaseClient,
  lastSyncAt: string,
  emptyMetadata: boolean,
  user: User,
  metadata?: Metadata,
) {
  if (emptyMetadata) {
    const { data, error } = await supabase
      .from('metadata')
      .select(
        'answers, correctAnswers, incorrectAnswers, createdFlashCards, accuracy, streak, lastSyncAt, theme, synced, activeStudyPlan, notificationPermission, updatedAt, createdAt, key',
      )
      .single();

    console.log(data, error);

    if (!error && data) {
      // Upsert into IndexedDB
      await db.metadata.put({
        ...data,
        lastSyncAt,
        synced: true,
        updatedAt: new Date().toUTCString(),
        key: 'current',
      } as unknown as Metadata);
    } else if (error && !data) {
      // When metadata is empty, insert default metadata
      await db.metadata.put({
        ...defaultMetadata,
        key: 'current',
        lastSyncAt,
        updatedAt: new Date().toUTCString(),
        synced: true,
      } as unknown as Metadata);
    }
  } else {
    const { data: cloudMetadata, error } = await supabase
      .from('metadata')
      .select(
        'answers, correctAnswers, incorrectAnswers, createdFlashCards, accuracy, streak, lastSyncAt, theme, synced, activeStudyPlan, notificationPermission, updatedAt, createdAt, key',
      )
      .single();

    if (!error) {
      console.log(error, cloudMetadata);
      const isNewer =
        new Date(cloudMetadata?.lastSyncAt).getTime() >
        new Date(metadata?.updatedAt ?? 0).getTime();
      console.log(isNewer);

      if (!isNewer) {
        const { error: metadataError } = await supabase
          .from('metadata')
          .update({
            ...metadata,
            lastSyncAt,
            updatedAt: new Date().toUTCString(),
            synced: true,
          })
          .eq('user_uuid', user.id);
        console.log(metadataError);
      } else {
        console.log('putting cloud metadata', cloudMetadata);
        await db.metadata.put({
          ...cloudMetadata,
          synced: true,
          updatedAt: new Date().toUTCString(),

          lastSyncAt,
        } as Metadata);
      }
    } else {
      console.log('putting to cloud metadata', metadata);
      await supabase.from('metadata').insert({
        ...metadata,
        lastSyncAt,
        updatedAt: new Date().toUTCString(),
        synced: true,
      });
    }
  }
}
