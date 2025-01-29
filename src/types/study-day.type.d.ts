export type StudyDay = {
  dayNumber: number;
  objectives: string[];
  cardsToReview: string[]; // frontUuid of flashcards
  newCards: string[];
  metrics: {
    targetRetention: number;
    maxStudyTime: number; // minutes
  };
};
