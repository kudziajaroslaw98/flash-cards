import type { StudySession } from './study-session.type';

export type Metadata = {
  answers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  createdFlashCards: number;
  accuracy: number;
  streak: number;
  lastSyncAt: Date | string | null;
  theme?: 'dark' | 'light';
  key: string;
  synced: boolean;
  activeStudyPlan?: StudySession;
  notificationPermission: 'granted' | 'denied' | 'default';
  marketingConsent: boolean;
  updatedAt: Date | string;
  createdAt: Date | string;
};
