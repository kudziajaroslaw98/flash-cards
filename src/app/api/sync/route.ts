import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import { FlashCard } from '#/shared/models/flash-card.model';
import { ApiSyncResponse } from '#/shared/types/api/api-sync-response.type';
import { StatsModel } from '#/shared/types/stats.type';
import checkValidity from '#/shared/utils/check-validity.util';
import { syncBodyValidationScheme } from '#/shared/validation-schemes/sync-body-validation.scheme';
import {
  SupabaseClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type requestBody = {
  flashcards: FlashCard[];
  stats: StatsModel;
  theme: 'light' | 'dark';
  lastSyncAt: Date | null;
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

async function validateBody(body: Record<string, unknown>) {
  const validityCheck = checkValidity(body, syncBodyValidationScheme);

  if (!validityCheck.valid) {
    throw new Error(validityCheck.error);
  }
}

async function newUserSync(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  await supabase.from('metadata').upsert(
    {
      userUuid,
      lastSyncAt: newLastSyncAt,
      theme: body.theme,
    },
    { onConflict: 'userUuid', ignoreDuplicates: false },
  );

  await supabase.from('stats').upsert(
    {
      userUuid,
      ...body.stats,
    },
    { onConflict: 'userUuid', ignoreDuplicates: false },
  );

  await supabase.from('flashcards').upsert(
    body.flashcards.map((flashcard) => ({
      userUuid,
      ...flashcard,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );
}

async function fetchDataFromDb(
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  const flashcards = await supabase
    .from('flashcards')
    .select('frontUuid, word, definition, weight, order')
    .eq('userUuid', userUuid);

  const stats = await supabase
    .from('stats')
    .select(
      'accuracy, answers, correctAnswers, createdFlashCards, incorrectAnswers',
    )
    .eq('userUuid', userUuid)
    .maybeSingle();

  await supabase
    .from('metadata')
    .update({ lastSyncAt: newLastSyncAt })
    .eq('userUuid', userUuid);

  return {
    flashcards: flashcards.data !== null ? flashcards.data : [],
    stats: stats.data !== null ? stats.data : DEFAULT_STATS,
  };
}

async function upsertDataInDb(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  const flashCardsUuids = body.flashcards.map(
    (flashcard) => flashcard.frontUuid,
  );

  const flashcardsUuidsToDelete = await supabase.rpc('get_missing_uuids', {
    uuids: flashCardsUuids,
  });

  await supabase.from('flashcards').upsert(
    body.flashcards.map((flashcard) => ({
      userUuid,
      ...flashcard,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );

  await supabase
    .from('stats')
    .update({ ...body.stats })
    .eq('userUuid', userUuid);

  await supabase
    .from('metadata')
    .update({ theme: body.theme, lastSyncAt: newLastSyncAt })
    .eq('userUuid', userUuid);

  if (flashcardsUuidsToDelete.data !== null) {
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsUuidsToDelete.data);
  }
}

export async function POST(request: Request) {
  const newLastSyncAt = new Date();

  try {
    const body: requestBody = await request.json();
    const cookieStore = cookies();

    validateBody(body);

    const responseBody: ApiSyncResponse = {
      flashcards: body.flashcards,
      stats: body.stats,
      theme: body.theme,
      lastSyncAt: newLastSyncAt,
    };

    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const userUuid = await getUserUuid(supabase);

    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('userUuid', userUuid)
      .maybeSingle();

    if (metadata.data.lastSyncAt === null) {
      await newUserSync(body, supabase, userUuid, newLastSyncAt);
    } else {
      if (
        body.lastSyncAt === null ||
        new Date(body.lastSyncAt) < new Date(metadata.data.lastSyncAt)
      ) {
        const { flashcards, stats } = await fetchDataFromDb(
          supabase,
          userUuid,
          newLastSyncAt,
        );

        responseBody.flashcards = flashcards;
        responseBody.stats = stats;
      } else if (body.lastSyncAt >= metadata.data.lastSyncAt) {
        await upsertDataInDb(body, supabase, userUuid, newLastSyncAt);
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
