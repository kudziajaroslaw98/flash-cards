import type { Metadata } from '#/types/metadata.type';

export const metadataMerge = (
  defaultMetadata: Metadata,
  metadata: Partial<Metadata>,
) => {
  return {
    accuracy: metadata.accuracy ?? defaultMetadata.accuracy,
    answers: metadata.answers ?? defaultMetadata.answers,
    correctAnswers: metadata.correctAnswers ?? defaultMetadata.correctAnswers,
    createdFlashCards:
      metadata.createdFlashCards ?? defaultMetadata.createdFlashCards,
    incorrectAnswers:
      metadata.incorrectAnswers ?? defaultMetadata.incorrectAnswers,
    lastSyncAt: metadata.lastSyncAt ?? defaultMetadata.lastSyncAt,
    streak: metadata.streak ?? defaultMetadata.streak,
  } as Metadata;
};
