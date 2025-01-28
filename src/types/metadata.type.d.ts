import type { DailyStat } from './daily-stat.type';
import type { FocusSession } from './focus-session.type';

export type Metadata = {
  answers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  createdFlashCards: number;
  accuracy: number;
  streak: number;
  lastSyncAt: Date | string | null;
  theme?: 'dark' | 'light';
  synced: boolean;

  dailyStats: DailyStat[];
  focusSessions: FocusSession[];
};
