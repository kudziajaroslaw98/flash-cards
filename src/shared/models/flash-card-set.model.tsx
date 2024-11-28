import type { FlashCard } from './flash-card.model';

export type FlashCardSet = {
  frontUuid: string;
  name: string;
  description: string;
  flashCards: FlashCard[];
  isFavourite: boolean;
  category?: string;
  hardlink: string;
};
