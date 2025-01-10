type BaseFlashCard = {
  frontUuid: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  spacedRepetition: SpacedRepetition;
  sets: string[];
};

export type SpacedRepetition = {
  interval: number;
  easeFactor: number;
  lastReviewAt: string | Date;
  dueDate: string | Date;
  reviews: number;
};

export type FlashCardType = 'index' | 'single' | 'question';

export type FlashCard = BaseFlashCard &
  (
    | {
        type: 'index';
        questionAddition: string;
        question?: string;
        answer?: string;
      }
    | {
        type: 'single';
        questionAddition: string;
        question: string;
        answer: string;
      }
    | {
        type: 'question';
        questionAddition?: string;
        question: string;
        answer: string;
      }
  );
