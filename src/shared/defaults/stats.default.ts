import type { Stats } from '#/types/stats.type';

export const DEFAULT_STATS: Stats = {
  answers: 0,
  accuracy: 0.0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  createdFlashCards: 10,
  streak: 1,
  lastSyncAt: new Date(),
};
