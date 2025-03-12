export function getRandomArrayItems(
  array: Flashcard[],
  itemsCount: number,
): Flashcard[] {
  return array.sort(() => Math.random() - 0.5).slice(0, itemsCount);
}
