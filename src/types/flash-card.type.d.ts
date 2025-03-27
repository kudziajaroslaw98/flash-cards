type BaseFlashcard = {
  frontUuid: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  spacedRepetition: SpacedRepetition;
  sets: string[];
  examples?: string;
  keyPoints?: string;
  synonyms?: string;
  relatedFacts?: string;
  tags: string[];
  synced: boolean;
  answer1?: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
};

export type SpacedRepetition = {
  interval: number;
  easeFactor: number;
  lastReviewAt: string | Date;
  dueDate: string | Date;
  reviews: number;
  weight: number;
  reversedWeight: number;
  culmulativeWeight: number;
  totalTimeSpent: number; // in seconds
  incorrectCount: number;
};

export type FlashcardType = 'index' | 'single' | 'question';

export type Flashcard = BaseFlashcard &
  (
    | {
        type: 'index';
        context: string;
        query?: string;
        definition?: string;
      }
    | {
        type: 'single';
        context: string;
        query: string;
        definition: string;
      }
    | {
        type: 'question';
        context?: string;
        query: string;
        definition: string;
      }
  );
