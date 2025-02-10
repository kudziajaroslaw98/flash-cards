import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { Metadata } from '#/types/metadata.type';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

type requestBody = {
  metadata: Metadata;
  theme: 'light' | 'dark';
  newLastSyncAt: Date;
};

async function newUserSync(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  await supabase.from('metadata').upsert(
    {
      user_uuid: userUuid,
      ...body.metadata,
      theme: body.theme,
      lastSyncAt: newLastSyncAt,
    },
    { onConflict: 'user_uuid', ignoreDuplicates: false },
  );
}

async function fetchDataFromDb(
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
): Promise<{ metadata: Metadata }> {
  const metadata = await supabase
    .from('metadata')
    .select(
      'accuracy, answers, correctAnswers, createdFlashCards, incorrectAnswers, streak, lastSyncAt, theme',
    )
    .eq('user_uuid', userUuid)
    .maybeSingle();

  await supabase
    .from('metadata')
    .update({ lastSyncAt: newLastSyncAt })
    .eq('user_uuid', userUuid);

  let updatedMetadata = metadata.data;

  if (metadata.data !== null) {
    updatedMetadata = { ...metadata.data, lastSyncAt: newLastSyncAt };
  }

  return {
    metadata:
      metadata.data !== null
        ? (updatedMetadata as Metadata)
        : { ...defaultMetadata, theme: 'dark', lastSyncAt: newLastSyncAt },
  };
}

async function upsertDataInDb(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  await supabase
    .from('metadata')
    .update({
      user_uuid: userUuid,
      ...body.metadata,
      theme: body.theme,
      lastSyncAt: newLastSyncAt,
    })
    .eq('user_uuid', userUuid);
}

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    metadata: z.object({
      accuracy: z.number().nonnegative(),
      answers: z.number().nonnegative(),
      correctAnswers: z.number().nonnegative(),
      createdFlashCards: z.number().nonnegative(),
      incorrectAnswers: z.number().nonnegative(),
      lastSyncAt: z.union([z.date(), z.null(), z.string()]),
      streak: z.number().nonnegative(),
    }),
    theme: z.enum(['light', 'dark']),
    newLastSyncAt: z.union([z.date(), z.string(), z.null()]),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    console.error('[metadata/sync] Invalid body', validityCheck.error);
    throw new Error(validityCheck.error);
  }
}

export type ApiMetadataSyncResponse = {
  metadata: Metadata;
  theme: 'light' | 'dark';
};
const rateLimit = new RateLimit(1, 10, '[metadata/sync]');

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  try {
    if (user === null || error !== null) {
      console.error('[metadata/sync] User not logged in');
      throw new Error('User not logged in');
    }

    rateLimit.checkRateLimit(user.id);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Rate limit exceeded',
      }),
    );
  }

  try {
    const body: requestBody = await request.json();

    validateBody(body);

    const responseBody: ApiMetadataSyncResponse = {
      metadata: { ...body.metadata, lastSyncAt: body.newLastSyncAt },
      theme: body.theme,
    };

    const userUuid = user.id;
    const supabase = await createClient();

    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('user_uuid', userUuid)
      .maybeSingle();

    const bodyDateAsNumber = body.metadata.lastSyncAt
      ? new Date(body.metadata.lastSyncAt).setSeconds(0, 0)
      : null;
    const metadataDate = metadata.data?.lastSyncAt
      ? new Date(metadata.data.lastSyncAt).setSeconds(0, 0)
      : null;
    const bodyDate = new Date(new Date(body.newLastSyncAt).setSeconds(0, 0));

    console.log(
      '[metadata/sync] User [',
      userUuid,
      '] Syncing data from [',
      metadataDate ? new Date(metadataDate).toISOString() : null,
      '] to [',
      bodyDate ? new Date(bodyDate).toISOString() : null,
      ']',
    );

    if (metadata.data === null || metadataDate === null) {
      console.log(
        '[metadata/sync] user (',
        userUuid,
        ') has no metadata, creating new metadata',
      );
      await newUserSync(body, supabase, userUuid, bodyDate);
    } else {
      if (bodyDateAsNumber === null || bodyDateAsNumber < metadataDate) {
        console.log(
          '[metadata/sync] user (',
          userUuid,
          ') has outdated metadata, fetching new data',
        );
        const { metadata } = await fetchDataFromDb(
          supabase,
          userUuid,
          bodyDate,
        );

        responseBody.metadata = {
          ...omit(metadata, ['theme']),
          lastSyncAt: bodyDate,
        };
        responseBody.theme = metadata.theme!;
      } else if (bodyDateAsNumber >= metadataDate) {
        console.log(
          '[metadata/sync] user (',
          userUuid,
          ') has up-to-date metadata, updating metadata',
        );
        await upsertDataInDb(body, supabase, userUuid, bodyDate);
      }
    }

    return Response.json({ success: true, data: responseBody });
  } catch (error) {
    console.error('[metadata/sync] Error syncing metadata', error);
    return Response.json({
      success: false,
      error:
        error ||
        'An error occurred while syncing your data. Please try again later.',
    });
  }
}
