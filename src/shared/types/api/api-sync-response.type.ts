import { FlashCardModel } from '#/shared/models/flash-card.model';
import { Stats } from '../local-storage-stats.type';

export type ApiSyncResponse = {
  flashcards: FlashCardModel[];
  stats: Stats;
  theme: 'dark' | 'light';
  lastSyncAt: Date;
};
