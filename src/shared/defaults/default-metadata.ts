import type { Metadata } from '#/types/metadata.type';

export const defaultMetadata: Metadata = {
  answers: 0,
  accuracy: 0.0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  createdFlashCards: 10,
  streak: 1,
  lastSyncAt: null,
  synced: false,
  notificationPermission: 'default',
  activeStudyPlan: undefined,
  updatedAt: new Date().toUTCString(),
  theme: 'dark',
  marketingConsent: false,
};
