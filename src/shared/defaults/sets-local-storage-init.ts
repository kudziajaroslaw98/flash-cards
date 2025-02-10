import type { FlashcardSet } from '#/types/flash-card-set.type';
import uuid from '../utils/uuid.util';

export const SETS_DB_DEFAULT: FlashcardSet[] = [
  {
    frontUuid: uuid(),
    name: 'Everyday Vocabulary Basics',
    description:
      'A set of simple and common words with their meanings, perfect for daily conversations and improving basic English vocabulary.',
    category: 'Language Learning',
    isFavourite: false,
    flashcards: [],
    hardlink: 'everyday-vocabulary-basics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
    reminders: [],
  },
];
