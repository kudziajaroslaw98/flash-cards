type BaseFlashCard = {
  frontUuid: string;
  weight: number;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type FlashCard = BaseFlashCard &
  (
    | {
        flashCardType: 'index';
        questionAddition: string;
        question?: string;
        answer?: string;
      }
    | {
        flashCardType: 'full';
        questionAddition: string;
        question: string;
        answer: string;
      }
    | {
        flashCardType: 'multiple';
        questionAddition: string;
        question?: string;
        answer: string;
      }
  );
