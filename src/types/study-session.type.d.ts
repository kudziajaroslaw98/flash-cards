export type StudySession = {
  id: string;
  planId: string;
  currentDay: number;
  completedCards: string[];
  startDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  synced: boolean;
};
