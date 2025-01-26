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
};
