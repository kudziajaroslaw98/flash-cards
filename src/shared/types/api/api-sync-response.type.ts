import { FlashCard } from '#/shared/models/flash-card.model';
import { Stats } from '../local-storage-stats.type';

export type ApiSyncResponse = {
  flashcards: FlashCard[];
  stats: Stats;
  theme: 'dark' | 'light';
  lastSyncAt: Date;
};
