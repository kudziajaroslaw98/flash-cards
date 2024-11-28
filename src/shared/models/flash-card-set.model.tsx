import type { FlashCard } from './flash-card.model';
import { UUID } from '#/types/uuid.type';

export type FlashCardSet = {
  frontUuid: UUID;
  name: string;
  description: string;
  flashCards: FlashCard[];
  isFavourite: boolean;
  category?: string;
  hardlink: string;
};
