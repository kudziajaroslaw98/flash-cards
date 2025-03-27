export type StudySession = {
  frontUuid: string;
  planId: string;
  stage: number;
  currentDay: number;
  completedCards: string[];
  correctCards: string[];
  incorrectCards: string[];
  startDate: Date | string;
  nextRevisionDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  synced: boolean;
};
