import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import checkValidity from '#/shared/utils/check-validity.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import omit from '#/shared/utils/omit.util';
import { z } from 'zod';

type requestBody = {
  sets: FlashCardSet[];
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
) {
  await supabase.from('sets').upsert(
    body.sets.map((set) => ({
      user_uuid: userUuid,
      ...set,
      flashCards: set.flashCards.map((flashcard) => flashcard.frontUuid),
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
      'frontUuid, question, questionAddition, answer, weight, order, createdAt, updatedAt',
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
      flashCards: set.flashCards.map((flashcard) => flashcard.frontUuid),
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
        category: z.string().min(1),
        hardlink: z.string().min(1),
        createdAt: z.union([z.date(), z.string()]),
        updatedAt: z.union([z.date(), z.string()]),
        flashCards: z.array(
          z.object({
            question: z.string().min(1),
            answer: z.string().min(1),
            questionAddition: z.string().min(1),
            order: z.number().nonnegative(),
            frontUuid: z.string().uuid(),
            weight: z.number().nonnegative(),
            createdAt: z.union([z.date(), z.string()]),
            updatedAt: z.union([z.date(), z.string()]),
          }),
        ),
      }),
    ),
    lastSyncAt: z.union([z.coerce.date(), z.null(), z.string()]),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

export type ApiSetsSyncResponse = {
  sets: FlashCardSet[];
};

export async function POST(request: Request) {
  try {
    const body: requestBody = await request.json();

    validateBody(body);

    const responseBody: ApiSetsSyncResponse = {
      sets: body.sets,
    };

    const supabase = await createClient();
    const userUuid = await getUserUuid(supabase);
    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('user_uuid', userUuid)
      .maybeSingle();

    const bodyDate = body.lastSyncAt
      ? new Date(body.lastSyncAt).setSeconds(0, 0)
      : null;
    const metadataDate = metadata.data.lastSyncAt
      ? new Date(metadata.data.lastSyncAt).setSeconds(0, 0)
      : null;

    if (metadata.data === null || metadataDate === null) {
      await newUserSync(body, supabase, userUuid);
    } else {
      if (bodyDate === null || bodyDate < metadataDate) {
        const { sets } = await fetchDataFromDb(supabase, userUuid);
        responseBody.sets = sets ?? [];
      } else if (bodyDate >= metadataDate) {
        await upsertDataInDb(body, supabase, userUuid);
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
