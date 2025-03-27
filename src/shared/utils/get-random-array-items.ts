import type { Flashcard } from '#/types/flash-card.type';

export function getRandomArrayItems(
  array: Flashcard[],
  itemsCount: number,
): Flashcard[] {
  return array.sort(() => Math.random() - 0.5).slice(0, itemsCount);
}
