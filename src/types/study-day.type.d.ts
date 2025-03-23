export type StudyDay = {
  frontUuid: string;
  planId: string;
  dayNumber: number;
  objectives: string[];
  cardsToReview: string[]; // frontUuid of flashcards
  newCards: string[];
  correctCards: string[];
  incorrectCards: string[];
  metrics: {
    targetRetention: number;
    maxStudyTime: number; // minutes
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  synced: boolean;
};
