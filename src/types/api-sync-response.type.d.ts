import type { FlashCard } from '#/shared/models/flash-card.model';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import type { Metadata } from './metadata.type';

export type ApiSyncResponse = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  metadata: Metadata;
  theme: 'dark' | 'light';
};
