import { db } from '#/db/dexie.db';
import binarySearch from '#/shared/utils/binary-search-weights.util';
import {
  calculateReversedWeight,
  calculateWeight,
} from '#/shared/utils/calculate-weight';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import type { Flashcard } from '#/types/flash-card.type';
import { useEffect, useMemo, useState } from 'react';

type SpaceRepetitionAlgorithmProps = {
  items: Flashcard[];
  debug?: boolean;
  numberOfItems?: number;
};

type UseSpacedRepetitionProps = {
  array: Flashcard[];
  numberOfItems?: number;
};
export default function useSpacedRepetition({
  array,
  numberOfItems = 4,
}: UseSpacedRepetitionProps) {
  const [randomItems, setRandomItems] = useState<Flashcard[] | null>(null);
  const [continueReroll, setContinueReroll] = useState(false);
  const todayItems = useMemo(
    () =>
      array.filter(
        (card) => new Date(card.spacedRepetition.dueDate) < new Date(),
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

  function findRandomWeightedItem({
    items,
    numberOfItems,
  }: {
    items: Flashcard[];
    numberOfItems: number;
  }) {
    const MAX_RETRIES = 10;

    const randomItems: Flashcard[] = [];
    const max = items[items.length - 1]?.spacedRepetition?.culmulativeWeight;

    let retries = 0;

    while (randomItems.length < numberOfItems && retries < MAX_RETRIES) {
      if (items.length <= numberOfItems) {
        return items;
      }

      const randomNumber = getRandomRangedNumber(0, max);
      const foundIndex = binarySearch(
        items,
        'spacedRepetition.culmulativeWeight',
        randomNumber,
      );

      if (foundIndex >= 0) {
        const item = items[foundIndex];

        if (!randomItems.includes(item) && item) {
          randomItems.push(item);
        } else {
          retries++;
          continue;
        }
      } else {
        retries++;
        continue;
      }
    }

    return randomItems.sort(
      (a, b) =>
        b.spacedRepetition.reversedWeight - a.spacedRepetition.reversedWeight,
    );
  }

  function findRandomItem(array: Flashcard[], numberOfItems: number) {
    return getRandomArrayItems(array, numberOfItems);
  }

  function getRandomArrayItems(
    array: Flashcard[],
    itemsCount: number,
  ): Flashcard[] {
    return array.sort(() => Math.random() - 0.5).slice(0, itemsCount);
  }

  function spaceRepetitionAlgorithm({
    items,
    numberOfItems = 4,
  }: SpaceRepetitionAlgorithmProps) {
    try {
      if (items.length === 0) {
        throw new Error(
          '[Spaced Repetition Algorithm] - No items in the array',
        );
      }

      let randomItems = [];
      randomItems = findRandomWeightedItem({
        items: items,
        numberOfItems,
      });

      return {
        randomItems,
      };
    } catch (e) {
      console.error(e);
      return {
        reversedWeights: [],
        randomItems: null,
        culmulativeWeights: [],
        min: null,
        max: null,
      };
    }
  }

  const recalculateCulmulatives = async () => {
    const items = await db.flashcards
      .toCollection()
      .sortBy('spacedRepetition.dueDate');

    const worker = new Worker(
      new URL('../workers/space-repetition-worker.ts', import.meta.url),
    );

    worker.postMessage({ action: 'calculate-culmilative', items });

    worker.onmessage = function (event) {
      console.log(event.data);
      db.flashcards.bulkUpdate(event.data.mappedItems);
    };

    worker.terminate();
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

    const itemCopy = { ...item };
    const sr = itemCopy.spacedRepetition;
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
    const currentDate = new Date();

    const DEFAULT_INTERVALS = {
      again: 10 / (24 * 60), // 10 minutes in days
      hard: 1 / 24, // 1 hour in days
      good: 1, // 1 day
      easy: 7, // 1 week
    };

    const calculateEaseFactor = (easeFactor: number) => {
      let q;
      switch (type) {
        case 'easy':
          q = 5;
          break;
        case 'good': {
          q = 4;
          break;
        }
        case 'hard': {
          q = 1;
          break;
        }
        case 'again': {
          q = 0;
          break;
        }
      }
      const sm2EaseFactor =
        easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      return sm2EaseFactor > 0 ? sm2EaseFactor : 0;
    };

    const calculateInterval = () => {
      const calculatedInterval = Math.round(
        sr.interval * sr.easeFactor * DEFAULT_INTERVALS[type],
      );
      return calculatedInterval > 0
        ? calculatedInterval
        : DEFAULT_INTERVALS[type];
    };

    sr.reviews += 1;
    sr.easeFactor = calculateEaseFactor(sr.easeFactor);
    sr.interval = calculateInterval();
    sr.lastReviewAt = currentDate;
    sr.dueDate = new Date(currentDate.getTime() + sr.interval * ONE_DAY_IN_MS);
    sr.weight = calculateWeight(sr.dueDate);
    sr.reversedWeight = calculateReversedWeight(
      sr.weight,
      overDueMax ?? allMax,
    );

    db.flashcards.update(item.frontUuid, itemCopy);
    recalculateCulmulatives();
  };

  useEffect(() => {
    if (array.length === 0 || (todayItems.length === 0 && !continueReroll)) {
      return;
    }

    const { randomItems } = spaceRepetitionAlgorithm({
      items: todayItems.length > 0 ? todayItems : array,
      numberOfItems,
    });

    if ((todayItems.length === 0 && continueReroll) || todayItems.length > 0) {
      setRandomItems(randomItems);
    }
  }, [array, numberOfItems, todayItems, continueReroll]);

  const reroll = () => {
    if (todayItems.length === 0) {
      if (!continueReroll) {
        return [];
      } else {
        const randomItems = findRandomItem(array, numberOfItems);

        setRandomItems(randomItems);

        return randomItems;
      }
    }

    const randomItems = findRandomWeightedItem({
      items: todayItems.length > 0 ? todayItems : array,
      numberOfItems,
    });

    setRandomItems(randomItems);

    return randomItems;
  };

  useEffect(() => {
    if (continueReroll) {
      reroll();
    }
  }, [continueReroll]);

  return {
    randomItems,
    reroll,
    calculateRepetition,
    continueReroll,
    setContinueReroll,
    todayItemsEnd: todayItems.length === 0,
  };
}
