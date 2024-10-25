import { UUID } from '../types/uuid.type';
import { FlashCard } from './flash-card.model';

export type FlashCardSet = {
  frontUuid: UUID;
  name: string;
  description: string;
  flashCards: FlashCard[];
  isFavourite: boolean;
  category?: string;
};
