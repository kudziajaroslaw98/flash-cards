type BaseFlashCard = {
  frontUuid: string;
  weight: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  revisedAt: string | Date;
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
        flashCardType: 'single';
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
