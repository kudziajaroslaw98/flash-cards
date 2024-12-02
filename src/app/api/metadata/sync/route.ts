import { DEFAULT_METADATA } from '#/shared/defaults/stats.default';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Metadata } from '#/types/metadata.type';
import omit from '#/shared/utils/omit.util';
import { z } from 'zod';

type requestBody = {
  metadata: Metadata;
  theme: 'light' | 'dark';
  lastSyncAt: Date;
};

async function getUserUuid(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null || user === undefined) {
    throw new Error('User not found');
  }

  return user.id;
}

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
        : { ...DEFAULT_METADATA, theme: 'dark', lastSyncAt: newLastSyncAt },
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
    lastSyncAt: z.union([z.date(), z.string()]),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

export type ApiMetadataSyncResponse = {
  metadata: Metadata;
  theme: 'light' | 'dark';
};

export async function POST(request: Request) {
  try {
    const body: requestBody = await request.json();

    validateBody(body);

    const responseBody: ApiMetadataSyncResponse = {
      metadata: { ...body.metadata, lastSyncAt: body.lastSyncAt },
      theme: body.theme,
    };

    const supabase = await createClient();
    const userUuid = await getUserUuid(supabase);
    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('user_uuid', userUuid)
      .maybeSingle();

    const bodyDateAsNumber = body.lastSyncAt
      ? new Date(body.lastSyncAt).setSeconds(0, 0)
      : null;
    const metadataDate = metadata.data.lastSyncAt
      ? new Date(metadata.data.lastSyncAt).setSeconds(0, 0)
      : null;
    const bodyDate = new Date(new Date(body.lastSyncAt).setSeconds(0, 0));

    if (metadata.data === null || metadataDate === null) {
      await newUserSync(body, supabase, userUuid, bodyDate);
    } else {
      if (bodyDateAsNumber === null || bodyDateAsNumber < metadataDate) {
        const { metadata } = await fetchDataFromDb(
          supabase,
          userUuid,
          bodyDate,
        );

        responseBody.metadata = omit(metadata, ['theme']);
        responseBody.theme = metadata.theme!;
      } else if (bodyDateAsNumber >= metadataDate) {
        await upsertDataInDb(body, supabase, userUuid, bodyDate);
      }
    }

    return Response.json({ success: true, data: responseBody });
  } catch (error) {
    return Response.json({
      success: false,
      error:
        error ||
        'An error occurred while syncing your data. Please try again later.',
    });
  }
}
