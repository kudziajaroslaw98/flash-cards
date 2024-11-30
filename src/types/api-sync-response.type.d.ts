import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { FlashCard } from '#/shared/models/flash-card.model';
import type { Metadata } from './metadata.type';

export type ApiSyncResponse = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  metadata: Metadata;
  theme: 'dark' | 'light';
};
