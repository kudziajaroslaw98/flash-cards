import type { FlashcardSet } from '#/types/flash-card-set.type';
import uuid from '../utils/uuid.util';

export const setsMerge = (
  defaultSet: Omit<FlashcardSet, 'frontUuid'>,
  set: Partial<FlashcardSet>,
) => {
  return {
    frontUuid: set.frontUuid ?? uuid(),
    name: set.name ?? defaultSet.name,
    description: set.description ?? defaultSet.description,
    flashcards: set.flashcards ?? defaultSet.flashcards,
    category: set.category ?? defaultSet.category,
    createdAt: set.createdAt ?? new Date().toISOString(),
    updatedAt: set.updatedAt ?? new Date().toISOString(),
    hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? defaultSet.hardlink,
  } as FlashcardSet;
};
