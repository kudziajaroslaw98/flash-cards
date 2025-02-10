import type { Metadata } from '#/types/metadata.type';

export const metadataMerge = (
  defaultMetadata: Metadata,
  metadata: Partial<Metadata>,
) => {
  return {
    notificationPermission:
      metadata.notificationPermission ?? defaultMetadata.notificationPermission,
    synced: metadata.synced ?? defaultMetadata.synced,
    theme: metadata.theme ?? defaultMetadata.theme,
    activeStudyPlan:
      metadata.activeStudyPlan ?? defaultMetadata.activeStudyPlan,
    updatedAt: metadata.updatedAt ?? defaultMetadata.updatedAt,
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
