import { FlashCard } from './flash-card.model';

export type FlashCardSet = {
  // TODO: Change to proper UUID type
  frontUuid: string;
  // frontUuid: UUID;
  name: string;
  description: string;
  flashCards: FlashCard[];
  isFavourite: boolean;
  category?: string;
};
