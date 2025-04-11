import type { FlashcardSet } from '#/types/flash-card-set.type';
import uuid from '../utils/uuid.util';

export const defaultSet: FlashcardSet = {
  frontUuid: uuid(),
  name: '',
  description: '',
  category: '',
  isFavourite: false,
  createdAt: new Date().toUTCString(),
  updatedAt: new Date().toUTCString(),
  flashcards: [],
  hardlink: '',
  synced: false,
  reminders: [],
  generationOptions: {},
} as FlashcardSet;
