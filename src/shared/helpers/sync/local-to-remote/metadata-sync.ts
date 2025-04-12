import { db } from '#/db/dexie.db';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function localToRemoteMetadataSync(
  supabase: SupabaseClient,
  user: User,
) {
  const metadata = await db.metadata.get('current');

  if (!metadata?.synced) {
    const unsyncedMetadata = { ...metadata, synced: true, user_uuid: user.id };
    console.log(user.id);

    const { error: metadataError } = await supabase
      .from('metadata')
      .upsert(unsyncedMetadata, { onConflict: 'user_uuid' });

    if (!metadataError) {
      await db.metadata.where('key').equals('current').modify({ synced: true });
    }
  }
}
