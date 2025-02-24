import type { Flashcard } from '#/types/flash-card.type';
import uuid from '../utils/uuid.util';

export const flashcardsMerge = (
  defaultFlashcard: Omit<Flashcard, 'frontUuid' | 'order'>,
  flashcard: Partial<Flashcard>,
) => {
  return {
    type: flashcard.type ?? 'index',
    frontUuid: flashcard.frontUuid ?? uuid(),
    query: flashcard.query ?? defaultFlashcard.query,
    context: flashcard.context ?? defaultFlashcard.context,
    definition: flashcard.definition ?? defaultFlashcard.definition,
    order: flashcard.order,
    createdAt: flashcard.createdAt ?? new Date().toUTCString(),
    updatedAt: flashcard.updatedAt ?? new Date().toUTCString(),
    spacedRepetition: {
      interval:
        flashcard?.spacedRepetition?.interval ??
        defaultFlashcard.spacedRepetition.interval,
      easeFactor:
        flashcard?.spacedRepetition?.easeFactor ??
        defaultFlashcard.spacedRepetition.easeFactor,
      lastReviewAt:
        flashcard?.spacedRepetition?.lastReviewAt ?? new Date().toUTCString(),
      dueDate:
        flashcard?.spacedRepetition?.dueDate ??
        new Date(Date.now() + 1000 * 60 * 10).toUTCString(),
      reviews:
        flashcard?.spacedRepetition?.reviews ??
        defaultFlashcard.spacedRepetition.reviews,
      weight:
        flashcard?.spacedRepetition?.weight ??
        defaultFlashcard.spacedRepetition.weight,
      reversedWeight:
        flashcard?.spacedRepetition?.reversedWeight ??
        defaultFlashcard.spacedRepetition.reversedWeight,
      culmulativeWeight:
        flashcard?.spacedRepetition?.culmulativeWeight ??
        defaultFlashcard.spacedRepetition.culmulativeWeight,
      incorrectCount:
        flashcard?.spacedRepetition?.incorrectCount ??
        defaultFlashcard.spacedRepetition.incorrectCount,
      totalTimeSpent:
        flashcard?.spacedRepetition?.totalTimeSpent ??
        defaultFlashcard.spacedRepetition.totalTimeSpent,
    },
    sets: flashcard?.sets ?? [],
    examples: flashcard?.examples ?? defaultFlashcard.examples,
    keyPoints: flashcard?.keyPoints ?? defaultFlashcard.keyPoints,
    synonyms: flashcard?.synonyms ?? defaultFlashcard.synonyms,
    relatedFacts: flashcard?.relatedFacts ?? defaultFlashcard.relatedFacts,
    tags: flashcard?.tags ?? defaultFlashcard.tags,
  } as Flashcard;
};
