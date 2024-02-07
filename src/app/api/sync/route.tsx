import { FlashCardModel } from '#/shared/models/flash-card.model';
import { ApiResponse } from '#/shared/types/api/api-response.type';
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
  flashcards: FlashCardModel[];
  stats: StatsModel;
  theme: 'light' | 'dark';
  lastSyncAt: Date | null;
  updatedAt: Date | null;
};

const getUserUuid = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null || user === undefined) {
    throw { message: 'User not found' };
  }

  return user.id;
};

const validateBody = (body: Record<string, unknown>) => {
  const validityCheck = checkValidity(body, syncBodyValidationScheme);

  if (!validityCheck.valid) {
    throw { message: validityCheck.error };
  }
};

const newUserSync = (
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) => {
  supabase.from('metadata').insert({
    userUuid,
    lastSyncAt: newLastSyncAt,
    theme: body.theme,
  });

  supabase.from('stats').insert({
    userUuid,
    ...body.stats,
  });

  supabase.from('flashcards').insert(
    body.flashcards.map((flashcard) => ({
      userUuid,
      ...flashcard,
    })),
  );
};

const fetchDataFromDb = async (supabase: SupabaseClient, userUuid: string) => {
  const flashcards = await supabase
    .from('flashcards')
    .select('frontUuid, word, definition, weight, order')
    .eq('userUuid', userUuid);

  const stats = await supabase
    .from('stats')
    .select('*')
    .eq('userUuid', userUuid)
    .maybeSingle();

  return {
    flashcards: flashcards.data !== null ? flashcards.data : [],
    stats: stats.data,
  };
};

const upsertDataInDb = async (
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
) => {
  // const flashcards = await supabase
  //   .from('flashcards')
  //   .select('frontUuid, word, definition, weight, order')
  //   .eq('userUuid', userUuid);
  // const stats = await supabase
  //   .from('stats')
  //   .select('*')
  //   .eq('userUuid', userUuid)
  //   .maybeSingle();
  // make sure you delete records which don't exist in the body.flashcards
  // return { flashcards, stats };
};

const getFlashCardsCount = async (
  supabase: SupabaseClient,
  userUuid: string,
) => {
  const flashCardsCount = await supabase
    .from('flashcards')
    .select('*')
    .eq('userUuid', userUuid)
    .select();

  return flashCardsCount.count === null ? 0 : flashCardsCount.count;
};

export async function POST(request: Request) {
  let response: ApiResponse<ApiSyncResponse>;
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

    // get user stats, flashcards, theme and lastSyncAt from supabase

    const metadata = await supabase
      .from('metadata')
      .select('*')
      .eq('userUuid', userUuid)
      .maybeSingle();

    const flashcardsCount = await getFlashCardsCount(supabase, userUuid);

    if (metadata.data?.lastSyncAt === null) {
      newUserSync(body, supabase, userUuid, newLastSyncAt);
    } else {
      if (
        body.lastSyncAt === null ||
        body.lastSyncAt < metadata.data.lastSyncAt
      ) {
        const { flashcards, stats } = await fetchDataFromDb(supabase, userUuid);

        responseBody.flashcards = flashcards;
        responseBody.stats = stats;
      } else if (
        body.lastSyncAt === metadata.data.lastSyncAt ||
        (body.updatedAt !== null &&
          body.updatedAt > metadata.data.lastSyncAt &&
          body.flashcards.length > flashcardsCount)
      ) {
        upsertDataInDb(body, supabase, userUuid);
      }
    }

    return Response.json({ success: true, data: responseBody });
  } catch (error: { message: string }) {
    return Response.json({
      success: false,
      error:
        error.message ||
        'An error occurred while syncing your data. Please try again later.',
    });
  }
}
