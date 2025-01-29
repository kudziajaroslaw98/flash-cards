import type { Flashcard } from '#/types/flash-card.type';

export const defaultFlashcard = {
  type: 'index',
  context: '',
  query: '',
  definition: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  spacedRepetition: {
    interval: 0,
    easeFactor: 1.3,
    lastReviewAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
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
