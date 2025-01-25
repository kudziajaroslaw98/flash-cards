import { RateLimit } from '#/shared/utils/api-limiter';
import checkValidity from '#/shared/utils/check-validity.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import omit from '#/shared/utils/omit.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { Flashcard } from '#/types/flash-card.type';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

type requestBody = {
  flashcards: Flashcard[];
  lastSyncAt: Date;
};

async function newUserSync(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
) {
  await supabase.from('flashcards').upsert(
    body.flashcards.map((flashcard) => ({
      user_uuid: userUuid,
      ...flashcard,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );
}

async function fetchDataFromDb(
  supabase: SupabaseClient,
  userUuid: string,
): Promise<{ flashcards: Flashcard[] }> {
  const flashcards = await supabase
    .from('flashcards')
    .select(
      'frontUuid, query, context, definition, order, createdAt, updatedAt, type, spacedRepetition, examples, keyPoints, synonyms, relatedFacts',
    )
    .eq('user_uuid', userUuid);
  return {
    flashcards:
      flashcards.data !== null ? (flashcards.data as Flashcard[]) : [],
  };
}

async function upsertDataInDb(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
) {
  // TODO: update only changed flashcards ?
  const flashcardsUuids = body.flashcards.map(
    (flashcard) => flashcard.frontUuid,
  );

  const flashcardsUuidsToDelete = await supabase.rpc(
    'get_missing_flashcards_uuids',
    {
      uuids: flashcardsUuids,
    },
  );

  if (flashcardsUuidsToDelete.data !== null) {
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsUuidsToDelete.data);
  }

  const { flashcards } = await fetchDataFromDb(supabase, userUuid);

  const changedFlashcards = body.flashcards.filter((flashcard) =>
    isDifferent(
      omit(flashcard, ['createdAt', 'updatedAt']),
      omit(
        flashcards.find(
          (f) => f.frontUuid === flashcard.frontUuid,
        ) as Flashcard,
        ['createdAt', 'updatedAt'],
      ),
    ),
  );

  await supabase.from('flashcards').upsert(
    changedFlashcards.map((flashcard) => ({
      user_uuid: userUuid,
      ...flashcard,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );
}

async function validateBody(body: Record<string, unknown>) {
  const validationScheme = z.object({
    flashcards: z.array(
      z.object({
        type: z
          .string()
          .includes('index')
          .or(z.string().includes('single'))
          .or(z.string().includes('question')),
        query: z.string().optional(),
        definition: z.string().optional(),
        context: z.string().optional(),
        order: z.number().nonnegative().or(z.null()),
        frontUuid: z.string().uuid(),
        createdAt: z.union([z.date(), z.string()]),
        updatedAt: z.union([z.date(), z.string()]),
        spacedRepetition: z.object({
          interval: z.number().nonnegative(),
          easeFactor: z.number().nonnegative(),
          reviews: z.number().nonnegative(),
          lastReviewAt: z.union([z.date(), z.string(), z.null()]),
          dueDate: z.union([z.date(), z.string()]),
        }),
        examples: z.string().optional(),
        keyPoints: z.string().optional(),
        synonyms: z.string().optional(),
        relatedFacts: z.string().optional(),
        sets: z.array(z.string().uuid()).or(z.null()),
      }),
    ),
    lastSyncAt: z.union([z.date(), z.string(), z.null()]),
  });
  const validityCheck = checkValidity(body, validationScheme);

  if (!validityCheck.valid) {
    console.error('[flashcard/sync] Invalid body', validityCheck.error);
    throw new Error(validityCheck.error);
  }
}

export type ApiFlashcardsSyncResponse = {
  flashcards: Flashcard[];
};
const rateLimit = new RateLimit(1, 10, '[flashcard/sync]');

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  try {
    if (user === null || error !== null) {
      console.error('[flashcard/sync] User not logged in');
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

    const responseBody: ApiFlashcardsSyncResponse = {
      flashcards: body.flashcards,
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
      '[flashcard/sync] User [',
      userUuid,
      '] Syncing data from [',
      metadataDate ? new Date(metadataDate).toISOString() : null,
      '] to [',
      bodyDate ? new Date(bodyDate).toISOString() : null,
      ']',
    );

    if (metadata.data === null || metadataDate === null) {
      console.log(
        '[flashcard/sync] user (',
        userUuid,
        ') has no metadata, creating new flashcards',
      );
      await newUserSync(body, supabase, userUuid);
    } else {
      if (bodyDate === null || bodyDate < metadataDate) {
        console.log(
          '[flashcard/sync] user (',
          userUuid,
          ') has outdated metadata, fetching new flashcards',
        );
        const { flashcards } = await fetchDataFromDb(supabase, userUuid);
        responseBody.flashcards = flashcards;
      } else if (bodyDate >= metadataDate) {
        console.log(
          '[flashcard/sync] user (',
          userUuid,
          ') has up-to-date metadata, updating flashcards',
        );
        await upsertDataInDb(body, supabase, userUuid);
      }
    }

    return Response.json({ success: true, data: responseBody });
  } catch (error) {
    console.error('[flashcard/sync] Error syncing data', error);
    return Response.json({
      success: false,
      error:
        error ||
        'An error occurred while syncing your data. Please try again later.',
    });
  }
}
