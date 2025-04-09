import { db } from '#/db/dexie.db';
import binarySearch from '#/shared/utils/binary-search-weights.util';
import {
  calculateReversedWeight,
  calculateWeight,
} from '#/shared/utils/calculate-weight';
import { getRandomArrayItems } from '#/shared/utils/get-random-array-items';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import type { Flashcard } from '#/types/flash-card.type';
import { useEffect, useMemo, useRef, useState } from 'react';

type UseSpacedRepetitionProps = {
  array: Flashcard[];
  numberOfItems?: number;
  revisedSetId: string;
};
export default function useSpacedRepetition({
  array,
  numberOfItems = 4,
  revisedSetId,
}: UseSpacedRepetitionProps) {
  const todayItemsRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [randomItems, setRandomItems] = useState<Flashcard[]>([]);
  const [sessionDeck, setSessionDeck] = useState<Flashcard[]>([]);
  const sessionSourceRef = useRef<'today' | 'all' | null>(null);
  const [continueReroll, setContinueReroll] = useState(false);
  const todayItems = useMemo(
    () =>
      array.filter(
        (card) =>
          new Date(card.spacedRepetition.dueDate).getTime() <
          new Date().getTime(),
      ),
    [array],
  );
  const overDueMax = useMemo(() => {
    if (!todayItems || todayItems.length === 0) {
      return 0; // Return 0 or any default value if the array is empty or undefined
    }
    return todayItems.reduce((max, item) => {
      const weight = item.spacedRepetition?.culmulativeWeight || 0; // Safely access the value
      return Math.max(max, weight);
    }, 0);
  }, [todayItems]);
  const allMax = useMemo(() => {
    if (!array || array.length === 0) {
      return 0; // Return 0 or any default value if the array is empty or undefined
    }
    return array.reduce((max, item) => {
      const weight = item.spacedRepetition?.culmulativeWeight || 0; // Safely access the value
      return Math.max(max, weight);
    }, 0);
  }, [array]);
  const setNameRef = useRef<string | null>(null);

  function findRandomWeightedItem({
    items,
    numberOfItems,
  }: {
    items: Flashcard[];
    numberOfItems: number;
  }) {
    const MAX_RETRIES = 10;
    let retries = 0;

    const itemsCopy = [...items];
    const selectedItems: Flashcard[] = [];
    const maxCumulativeWeight =
      itemsCopy[itemsCopy.length - 1]?.spacedRepetition?.culmulativeWeight;

    if (itemsCopy.length === 0) return [];
    if (itemsCopy.length <= numberOfItems) return itemsCopy;

    itemsCopy.sort(
      (a, b) =>
        (a.spacedRepetition.culmulativeWeight ?? 0) -
        (b.spacedRepetition.culmulativeWeight ?? 0),
    );

    while (
      selectedItems.length < numberOfItems &&
      itemsCopy.length > 0 &&
      retries < MAX_RETRIES
    ) {
      const randomNumber = getRandomRangedNumber(0, maxCumulativeWeight);
      const foundIndex = binarySearch(
        itemsCopy,
        'spacedRepetition.culmulativeWeight',
        randomNumber,
      );

      if (foundIndex !== -1 && itemsCopy[foundIndex]) {
        const item = itemsCopy.splice(foundIndex, 1)[0]; // Select and remove the item
        selectedItems.push(item);
        // Recalculate max weight? Potentially complex, skip for now assuming distribution remains similar enough
        retries = 0;
      } else {
        // Handle case where binary search didn't find an exact match (might land between items)
        // Or if index was -1. A simple retry might suffice.
        retries++;
      }
    }

    if (selectedItems.length < numberOfItems) {
      console.warn(
        `[Spaced Repetition] Could only select ${selectedItems.length} weighted items.`,
      );
    }

    return selectedItems.sort(
      (a, b) =>
        b.spacedRepetition.reversedWeight - a.spacedRepetition.reversedWeight,
    );
  }

  function findRandomItem({
    items,
    numberOfItems,
  }: {
    items: Flashcard[];
    numberOfItems: number;
  }) {
    return getRandomArrayItems(items, numberOfItems);
  }

  const recalculateCulmulatives = async () => {
    const items = await db.flashcards
      .toCollection()
      .sortBy('spacedRepetition.dueDate');

    if (items.length === 0 || !workerRef.current) return;

    workerRef.current!.postMessage({
      action: 'calculate-culmilative',
      items: items,
    });
    workerRef.current!.onmessage = async function (event) {
      await db.flashcards.bulkPut(event.data.mappedItems);
    };
  };

  const calculateRepetition = async (
    item: Flashcard,
    type: 'easy' | 'again' | 'good' | 'hard',
  ) => {
    if (
      todayItems.length === 0 &&
      continueReroll &&
      (type === 'easy' || type === 'good')
    ) {
      return item;
    }

    const itemCopy = structuredClone(item);
    const sr = itemCopy.spacedRepetition;
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
    const currentDate = new Date();

    const DEFAULT_INTERVALS_IN_DAYS = {
      again: 10 / (24 * 60), // 10 minutes in days
      hard: 1 / 24, // 1 hour in days
      good: sr.interval < 1 ? 1 : sr.interval * sr.easeFactor, // 1 day
      easy: sr.interval < 1 ? 4 : sr.interval * sr.easeFactor * 1.3, // 1 week
    };

    let quality: number;
    switch (type) {
      case 'again':
        quality = 0;
        break;
      case 'hard':
        quality = 3;
        break; // Adjusted based on common SM-2 interpretation
      case 'good':
        quality = 4;
        break;
      case 'easy':
        quality = 5;
        break;
      default:
        quality = 4; // Default to good
    }

    if (quality < 3) {
      // Failed recall, reset interval
      sr.reviews = 0; // Reset review count for interval calculation
      sr.interval = DEFAULT_INTERVALS_IN_DAYS.again; // Start over with 'again' interval
    } else {
      // Successful recall
      sr.reviews += 1;
      // Update ease factor
      sr.easeFactor = Math.max(
        1.3,
        sr.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      );

      // Calculate next interval based on review count and type
      if (sr.reviews === 1) {
        sr.interval = DEFAULT_INTERVALS_IN_DAYS.good; // Typically 1 day first time
      } else if (sr.reviews === 2) {
        sr.interval = Math.max(DEFAULT_INTERVALS_IN_DAYS.good + 1, 6); // Typically 6 days second time
      } else {
        sr.interval = Math.round(sr.interval * sr.easeFactor);
      }

      // Apply type specific multiplier/adjustment *after* base interval calculation if needed
      if (type === 'hard') {
        // If marked hard, slightly reduce next interval compared to 'good'
        sr.interval = Math.max(
          DEFAULT_INTERVALS_IN_DAYS.hard,
          sr.interval * 0.8,
        );
      } else if (type === 'easy') {
        // If marked easy, slightly increase next interval
        sr.interval = Math.max(
          DEFAULT_INTERVALS_IN_DAYS.easy,
          sr.interval * 1.2,
        );
      }
    }

    sr.lastReviewAt = currentDate;
    sr.dueDate = new Date(currentDate.getTime() + sr.interval * ONE_DAY_IN_MS);
    sr.weight = calculateWeight(sr.dueDate);
    sr.reversedWeight = calculateReversedWeight(
      sr.weight,
      overDueMax ?? allMax,
    );

    db.flashcards.update(item.frontUuid, { spacedRepetition: sr });
    recalculateCulmulatives();

    return itemCopy;
  };

  const reroll = (lastItemFrontUuid?: string) => {
    let currentDeck = [...sessionDeck];
    if (lastItemFrontUuid) {
      currentDeck = currentDeck.filter(
        (item) => item.frontUuid !== lastItemFrontUuid,
      );
      // Update the session deck state immediately
      setSessionDeck(currentDeck);
    }
    if (currentDeck.length === 0) {
      setRandomItems([]); // No more items left in this session
      sessionSourceRef.current = null; // Indicate session ended
      console.log('[Spaced Repetition] Session deck empty.');
      return [];
    }

    const useWeighted = sessionSourceRef.current === 'today';
    const drawFunction = useWeighted ? findRandomWeightedItem : findRandomItem;
    const nextRandomItems = drawFunction({
      items: currentDeck,
      numberOfItems,
    });

    setRandomItems(nextRandomItems);
    return nextRandomItems;
  };

  useEffect(() => {
    console.log(
      setNameRef.current,
      revisedSetId,
      array,
      continueReroll,
      numberOfItems,
    );
    if (
      (array.length === 0 && !continueReroll) ||
      (setNameRef.current === revisedSetId && setNameRef.current !== null)
    ) {
      return;
    }

    let initialDeck: Flashcard[] = [];
    let source: 'today' | 'all' | null = null;

    // Use the *current* array prop to determine today's items for *this specific set*
    const currentTodayItems = array.filter(
      (card) =>
        new Date(card.spacedRepetition.dueDate).getTime() <
        new Date().getTime(),
    );

    if (currentTodayItems.length > 0) {
      // If there are items due for the current set, use them
      source = 'today';
      initialDeck = [...currentTodayItems];
      console.log(
        `[Spaced Repetition] Initializing deck with ${initialDeck.length} Today's items for set: ${revisedSetId}`,
      );
      setNameRef.current = revisedSetId;
    } else if (continueReroll && array.length > 0) {
      // If no items are due OR we finished them, AND continueReroll is true, use all items from the current set
      source = 'all';
      initialDeck = [...array];
      console.log(
        `[Spaced Repetition] Initializing deck with ${initialDeck.length} All items (continueReroll) for set: ${revisedSetId}`,
      );
      setNameRef.current = revisedSetId;
    } else {
      // No items due and not continuing, or array is empty
      source = null;
      initialDeck = [];
      console.log(
        `[Spaced Repetition] Initializing deck as empty for set: ${revisedSetId}. No items due or not continuing.`,
      );
    }

    setSessionDeck(initialDeck);
    sessionSourceRef.current = source;

    if (initialDeck.length > 0) {
      const useWeighted = source === 'today';
      const drawFunction = useWeighted
        ? findRandomWeightedItem
        : findRandomItem;
      const initialRandomItems = drawFunction({
        items: initialDeck,
        numberOfItems,
      });
      setRandomItems(initialRandomItems);
    } else {
      setRandomItems([]); // Clear random items if deck is empty
    }

    // No need to update arrayRef here
    // Dependencies: watch for changes in the calculated todayItems, the continueReroll flag,
    // the base array reference, and numberOfItems.
  }, [revisedSetId, array, continueReroll, numberOfItems]);

  useEffect(() => {
    if (todayItems.length > 0 && todayItemsRef.current === null) {
      // Set the initial count only once when items first become available
      todayItemsRef.current = todayItems.length;
    } else if (todayItems.length === 0 && todayItemsRef.current !== null) {
      setNameRef.current = null;

      // Reset if today's items are cleared (e.g., session finished)
      // This might depend on desired behavior - keep showing total reviewed vs initial?
      // todayItemsRef.current = null; // Optional: reset when empty
    }
  }, [todayItems]);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/space-repetition-worker.ts', import.meta.url),
      { type: 'module' }, // Ensure worker type is module if using modern JS features
    );
    workerRef.current = worker;

    // Initial calculation if array has items on mount
    if (array.length > 0) {
      recalculateCulmulatives();
    }

    return () => {
      console.log('[Spaced Repetition] Terminating worker.');
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    randomItems,
    reroll,
    calculateRepetition,
    continueReroll,
    setContinueReroll,
    todayItems: todayItemsRef.current,
    availableTodayItems: todayItems.length,
    sessionItemsCount: sessionDeck.length,
  };
}
