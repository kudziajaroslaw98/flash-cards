import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

type requestBody = {
  sets: FlashCardSet[];
  lastSyncAt: Date | null;
};

async function newUserSync(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
) {
  await supabase.from('sets').upsert(
    body.sets.map((set) => ({
      user_uuid: userUuid,
      ...set,
      flashCards: set.flashCards,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );
}

async function fetchDataFromDb(
  supabase: SupabaseClient,
  userUuid: string,
): Promise<{ sets: FlashCardSet[] }> {
  const flashcards = await supabase
    .from('flashcards')
    .select(
      'frontUuid, question, questionAddition, answer, order, createdAt, updatedAt, type, spacedRepetition',
    )
    .eq('user_uuid', userUuid);

  const sets = await supabase
    .from('sets')
    .select(
      'frontUuid, name, description, isFavourite, category, hardlink,createdAt, updatedAt, flashCards',
    )
    .eq('user_uuid', userUuid);

  let mappedSets = sets.data;

  if (sets.data !== null && flashcards.data !== null) {
    mappedSets = sets.data?.map((set) => ({
      ...set,
      flashCards: set.flashCards.map((flashcard: string) =>
        flashcards.data?.find((card) => card.frontUuid === flashcard),
      ),
    }));
  }

  return {
    sets: sets.data !== null ? mappedSets! : [],
  };
}

async function upsertDataInDb(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
) {
  const setsUuids = body.sets.map((set) => set.frontUuid);

  const setsUuidsToDelete = await supabase.rpc('get_missing_sets_uuids', {
    uuids: setsUuids,
  });

  if (setsUuidsToDelete.data !== null) {
    await supabase
      .from('sets')
      .delete()
      .in('frontUuid', setsUuidsToDelete.data);
  }

  const { sets } = await fetchDataFromDb(supabase, userUuid);

  const changedFlashcards = body.sets.filter((set) =>
    isDifferent(
      omit(sets.find((s) => s.frontUuid === set.frontUuid) as FlashCardSet, [
        'createdAt',
        'updatedAt',
      ]),
      omit(set, ['createdAt', 'updatedAt']),
    ),
  );

  await supabase.from('sets').upsert(
    changedFlashcards.map((set) => ({
      user_uuid: userUuid,
      ...set,
      flashCards: set.flashCards,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );
}

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    sets: z.array(
      z.object({
        frontUuid: z.string().uuid(),
        name: z.string().min(1),
        description: z.string().min(1),
        isFavourite: z.boolean(),
        category: z.string().optional(),
        hardlink: z.string().min(1),
        createdAt: z.union([z.date(), z.string()]),
        updatedAt: z.union([z.date(), z.string()]),
        flashCards: z.array(z.string().uuid()),
      }),
    ),
    lastSyncAt: z.union([z.date(), z.null(), z.string()]),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    console.error('[set/sync] Invalid body', validityCheck.error);
    throw new Error(validityCheck.error);
  }
}

export type ApiSetsSyncResponse = {
  sets: FlashCardSet[];
};

const rateLimit = new RateLimit(1, 10, '[set/sync]');

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  try {
    if (user === null || error !== null) {
      console.error('[set/sync] User not logged in');
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
    console.log(body);
    console.log(body.sets.map((set) => set.flashCards));
    validateBody(body);

    const responseBody: ApiSetsSyncResponse = {
      sets: body.sets,
    };

    const userUuid = user.id;
    const supabase = await createClient();
    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('user_uuid', userUuid)
      .maybeSingle();

    const bodyDate = body.lastSyncAt
      ? new Date(body.lastSyncAt).setSeconds(0, 0)
      : null;
    const metadataDate = metadata.data?.lastSyncAt
      ? new Date(metadata.data.lastSyncAt).setSeconds(0, 0)
      : null;

    console.log(
      '[set/sync] User [',
      userUuid,
      '] Syncing data from [',
      metadataDate ? new Date(metadataDate).toISOString() : null,
      '] to [',
      bodyDate ? new Date(bodyDate).toISOString() : null,
      ']',
    );

    if (metadata.data === null || metadataDate === null) {
      console.log(
        '[set/sync] user (',
        userUuid,
        ') has no metadata, creating new sets',
      );
      await newUserSync(body, supabase, userUuid);
    } else {
      if (bodyDate === null || bodyDate < metadataDate) {
        console.log(
          '[set/sync] user (',
          userUuid,
          ') has old metadata, fetching new sets',
        );
        const { sets } = await fetchDataFromDb(supabase, userUuid);
        responseBody.sets = sets ?? [];
      } else if (bodyDate >= metadataDate) {
        console.log(
          '[set/sync] user (',
          userUuid,
          ') has up-to-date metadata, updating sets',
        );
        await upsertDataInDb(body, supabase, userUuid);
      }
    }

    return Response.json({ success: true, data: responseBody });
  } catch (error) {
    console.error('[set/sync] Error syncing data', error);
    return Response.json({
      success: false,
      error:
        error ||
        'An error occurred while syncing your data. Please try again later.',
    });
  }
}
