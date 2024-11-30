export type Metadata = {
  answers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  createdFlashCards: number;
  accuracy: number;
  streak: number;
  lastSyncAt: Date | null;
  theme?: 'dark' | 'light';
};
