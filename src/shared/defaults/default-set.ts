import type { FlashcardSet } from '#/types/flash-card-set.type';
import uuid from '../utils/uuid.util';

export const defaultSet: FlashcardSet = {
  frontUuid: uuid(),
  name: '',
  description: '',
  category: '',
  isFavourite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  flashcards: [],
  hardlink: '',
  synced: false,
  reminders: [],
} as FlashcardSet;
