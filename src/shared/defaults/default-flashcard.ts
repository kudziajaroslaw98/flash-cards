import type { Flashcard } from '#/types/flash-card.type';

export const defaultFlashcard = {
  type: 'index',
  context: '',
  query: '',
  definition: '',
  createdAt: new Date().toUTCString(),
  updatedAt: new Date().toUTCString(),
  spacedRepetition: {
    interval: 0,
    easeFactor: 1.3,
    lastReviewAt: new Date().toUTCString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 10).toUTCString(),
    reviews: 0,
    weight: 0,
    reversedWeight: 0,
    culmulativeWeight: 0,
    incorrectCount: 0,
    totalTimeSpent: 0,
  },
  sets: [],
  examples: '',
  keyPoints: '',
  synonyms: '',
  relatedFacts: '',
  tags: [],
  synced: false,
} as Omit<Flashcard, 'frontUuid' | 'order'>;
