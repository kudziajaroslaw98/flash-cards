import { syncBodyValidationScheme } from '#/shared/validation-schemes/sync-body-validation.scheme';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { ApiSyncResponse } from '#/types//api-sync-response.type';
import { DEFAULT_METADATA } from '#/shared/defaults/stats.default';
import type { FlashCard } from '#/shared/models/flash-card.model';
import checkValidity from '#/shared/utils/check-validity.util';
import { createClient } from '#/shared/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Metadata } from '#/types/metadata.type';

type requestBody = {
  flashcards: FlashCard[];
  metadata: Metadata;
  sets: FlashCardSet[];
  theme: 'light' | 'dark';
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
      user_uuid: userUuid,
      ...body.metadata,
      theme: body.theme,
      lastSyncAt: newLastSyncAt,
    },
    { onConflict: 'user_uuid', ignoreDuplicates: false },
  );

  await supabase.from('sets').upsert(
    body.sets.map((set) => ({
      user_uuid: userUuid,
      ...set,
      flashCards: set.flashCards.map((flashcard) => flashcard.frontUuid),
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );

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
  newLastSyncAt: Date,
) {
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

  let mappedSets = sets.data;
  let updatedMetadata = metadata.data;

  if (sets.data !== null && flashcards.data !== null) {
    mappedSets = sets.data?.map((set) => ({
      ...set,
      flashCards: set.flashCards.map((flashcard: string) =>
        flashcards.data?.find((card) => card.frontUuid === flashcard),
      ),
    }));
  }

  if (metadata.data !== null) {
    updatedMetadata = { ...metadata.data, lastSyncAt: newLastSyncAt };
  }

  return {
    flashcards: flashcards.data !== null ? flashcards.data : [],
    metadata: metadata.data !== null ? updatedMetadata : DEFAULT_METADATA,
    sets: sets.data !== null ? mappedSets : [],
  };
}

async function upsertDataInDb(
  body: requestBody,
  supabase: SupabaseClient,
  userUuid: string,
  newLastSyncAt: Date,
) {
  // TODO: update only changed flashcards ?

  const flashCardsUuids = body.flashcards.map(
    (flashcard) => flashcard.frontUuid,
  );
  const setsUuids = body.sets.map((set) => set.frontUuid);

  const flashcardsUuidsToDelete = await supabase.rpc(
    'get_missing_flashcards_uuids',
    {
      uuids: flashCardsUuids,
    },
  );
  const setsUuidsToDelete = await supabase.rpc('get_missing_sets_uuids', {
    uuids: setsUuids,
  });

  await supabase
    .from('metadata')
    .update({
      user_uuid: userUuid,
      ...body.metadata,
      theme: body.theme,
      lastSyncAt: newLastSyncAt,
    })
    .eq('user_uuid', userUuid);

  await supabase.from('sets').upsert(
    body.sets.map((set) => ({
      user_uuid: userUuid,
      ...set,
      flashCards: set.flashCards.map((flashcard) => flashcard.frontUuid),
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );

  await supabase.from('flashcards').upsert(
    body.flashcards.map((flashcard) => ({
      user_uuid: userUuid,
      ...flashcard,
    })),
    { onConflict: 'frontUuid', ignoreDuplicates: false },
  );

  if (flashcardsUuidsToDelete.data !== null) {
    await supabase
      .from('flashcards')
      .delete()
      .in('frontUuid', flashcardsUuidsToDelete.data);
  }

  if (setsUuidsToDelete.data !== null) {
    await supabase
      .from('sets')
      .delete()
      .in('frontUuid', setsUuidsToDelete.data);
  }
}

export async function POST(request: Request) {
  const newLastSyncAt = new Date();

  try {
    const body: requestBody = await request.json();

    validateBody(body);

    const responseBody: ApiSyncResponse = {
      flashcards: body.flashcards,
      sets: body.sets,
      metadata: body.metadata,
      theme: body.theme,
    };

    const supabase = await createClient();
    const userUuid = await getUserUuid(supabase);
    const metadata = await supabase
      .from('metadata')
      .select()
      .eq('user_uuid', userUuid)
      .maybeSingle();

    const bodyDate = body.metadata.lastSyncAt
      ? new Date(body.metadata.lastSyncAt).setSeconds(0, 0)
      : null;
    const metadataDate = metadata.data.lastSyncAt
      ? new Date(metadata.data.lastSyncAt).setSeconds(0, 0)
      : null;

    console.log('metadata body', bodyDate);
    console.log('metadata', metadataDate);
    console.log(bodyDate! < metadataDate!);
    console.log(bodyDate! >= metadataDate!);

    if (metadata.data === null || metadataDate === null) {
      await newUserSync(body, supabase, userUuid, newLastSyncAt);
    } else {
      if (bodyDate === null || bodyDate < metadataDate) {
        const { flashcards, sets, metadata } = await fetchDataFromDb(
          supabase,
          userUuid,
          newLastSyncAt,
        );

        if (flashcards !== null && sets !== null && metadata !== null) {
          const newMetadata: Metadata = {
            accuracy: metadata.accuracy,
            answers: metadata.answers,
            correctAnswers: metadata.correctAnswers,
            createdFlashCards: metadata.createdFlashCards,
            incorrectAnswers: metadata.incorrectAnswers,
            streak: metadata.streak,
            lastSyncAt: newLastSyncAt,
          };

          responseBody.flashcards = flashcards;
          responseBody.sets = sets as FlashCardSet[];
          responseBody.metadata = newMetadata as Metadata;
          responseBody.theme = metadata.theme ?? 'dark';
        }
      } else if (bodyDate >= metadataDate) {
        await upsertDataInDb(body, supabase, userUuid, newLastSyncAt);
      }
    }

    responseBody.metadata.lastSyncAt = newLastSyncAt;

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
