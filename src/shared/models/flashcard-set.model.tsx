import { FlashCard } from './flash-card.model';

export type FlashCardSet = {
  frontUuid: string;
  uuid: string;
  name: string;
  description: string;
  flashCards: FlashCard[];
  isFavourite: boolean;
  category?: string;
};
