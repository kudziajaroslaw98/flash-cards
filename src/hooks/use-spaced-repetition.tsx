import binarySearch from '#/shared/utils/binary-search-weights.util';
import { deepFind } from '#/shared/utils/deep-find';
import getRandomRangedNumber from '#/shared/utils/get-random-ranged-number.util';
import type { DotNestedKeys } from '#/types/dot-nested-keys.type';
import { useEffect, useState } from 'react';

export type WeightedItem<T> = T & { weight: number };

type DifferentiateItems<T> = {
  differentiateBy?: DotNestedKeys<T>;
};

type SpaceRepetitionAlgorithmProps<T> = {
  items: T[];
  debug?: boolean;
  numberOfItems?: number;
} & DifferentiateItems<T>;

type UseSpacedRepetitionProps<T> = {
  array: T[];
  numberOfItems?: number;
  setArray?: T[];
  filterCondition?: (item: T) => boolean;
  differentiateBy?: DotNestedKeys<T>;
} & DifferentiateItems<T>;

type SpaceRepetitionResponse<T> = {
  reversedWeights: WeightedItem<T>[];
  randomItems: T[] | null;
  culmulativeWeights: number[];
  min: number | null;
  max: number | null;
};

type SpaceRepetitionConfig = {
  spacedRepetition: {
    interval: number;
    easeFactor: number;
    dueDate: string | Date;
    lastReviewAt: string | Date;
    reviews: number;
  };
};

export default function useSpacedRepetition<T extends SpaceRepetitionConfig>({
  array,
  numberOfItems = 4,
  setArray = undefined,
  differentiateBy = undefined,
}: UseSpacedRepetitionProps<T>) {
  const [reversedWeights, setReversedWeights] = useState<WeightedItem<T>[]>([]);
  const [culmulativeWeights, setCulmulativeWeights] = useState<number[]>([]);
  const [randomItems, setRandomItems] = useState<T[] | null>(null);
  const [continueReroll, setContinueReroll] = useState(false);
  const [todayItemsEnd, setTodayItemsEnd] = useState(false);

  function findRandomWeightedItem<T extends SpaceRepetitionConfig>({
    culmulativeWeights,
    reversedWeights,
    numberOfItems,
    differentiateBy,
  }: {
    culmulativeWeights: number[];
    reversedWeights: WeightedItem<T>[];
    numberOfItems: number;
  } & DifferentiateItems<T>) {
    const MAX_RETRIES = 10;

    const randomItems: WeightedItem<T>[] = [];
    const internalCulmulativeWeights: number[] = [];
    const internalWeightedArray: WeightedItem<T>[] = [];

    let retries = 0;
    // if every item is outdated
    if (reversedWeights.every((item) => item.weight === 600)) {
      return getRandomArrayItems(reversedWeights, numberOfItems);
    }

    while (randomItems.length < numberOfItems && retries < MAX_RETRIES) {
      const weights =
        internalCulmulativeWeights.length > 0
          ? internalCulmulativeWeights
          : culmulativeWeights;
      const items =
        internalWeightedArray.length > 0
          ? internalWeightedArray
          : reversedWeights;

      if (items.length <= numberOfItems) {
        return items;
      }

      const summedMinutes = weights.reduce((a, b) => a + b, 0);
      const randomNumber = getRandomRangedNumber(0, summedMinutes);
      const foundIndex = binarySearch(weights, randomNumber);

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

      if (
        randomItems.length > 0 &&
        internalCulmulativeWeights.length === 0 &&
        internalWeightedArray.length === 0 &&
        differentiateBy
      ) {
        internalWeightedArray.push(
          ...reversedWeights.filter(
            (item) =>
              deepFind(item, differentiateBy) ===
              deepFind(randomItems[0], differentiateBy),
          ),
        );

        internalWeightedArray.forEach((item, index) => {
          if (internalCulmulativeWeights.length === 0) {
            internalCulmulativeWeights.push(item.weight);
          } else {
            internalCulmulativeWeights.push(
              internalCulmulativeWeights[index - 1] + item.weight,
            );
          }
        });
      }
    }

    return randomItems.sort((a, b) => b.weight - a.weight);
  }

  function findRandomItem<T>(array: T[], numberOfItems: number) {
    return getRandomArrayItems(array, numberOfItems);
  }

  function getRandomArrayItems<T>(array: T[], itemsCount: number): T[] {
    return array.sort(() => Math.random() - 0.5).slice(0, itemsCount);
  }

  function spaceRepetitionAlgorithm<T extends SpaceRepetitionConfig>({
    items,
    numberOfItems = 4,
    differentiateBy,
  }: SpaceRepetitionAlgorithmProps<T>): SpaceRepetitionResponse<T> {
    try {
      if (items.length === 0) {
        throw new Error(
          '[Spaced Repetition Algorithm] - No items in the array',
        );
      }

      let min: number | null = null;
      let max: number | null = null;

      //TODO: split to workers for better performance

      const culmulativeWeights: number[] = [];
      const mappedItems: WeightedItem<T>[] = items.map((item: T) => {
        const date = item.spacedRepetition.dueDate;
        const difference = new Date(date).getTime() - Date.now();
        const dateInMinutes = Math.round(
          (difference < 0 ? 0 : difference) / 1000 / 60,
        );

        if (min === null) {
          min = dateInMinutes;
        }

        if (max === null) {
          max = dateInMinutes;
        }

        if (dateInMinutes < min) {
          min = dateInMinutes;
        } else if (dateInMinutes > max) {
          max = dateInMinutes;
        }
        return { ...item, weight: dateInMinutes };
      });

      if (min === null || max === null) {
        throw new Error(
          '[Spaced Repetition Algorithm] - No dates in the array',
        );
      }

      const reversedWeights: WeightedItem<T>[] = mappedItems.map(
        (item, index) => {
          let newWeight = max! - item.weight;

          if (newWeight < 600) {
            newWeight = 600;
          }

          if (index === 0) {
            culmulativeWeights.push(newWeight);
          } else {
            culmulativeWeights.push(culmulativeWeights[index - 1] + newWeight);
          }

          return {
            ...item,
            weight: newWeight,
          };
        },
      );

      reversedWeights.sort((a, b) => b.weight - a.weight);

      let randomItems = [];

      const currentDate = new Date();
      const indexesToFilterOut: number[] = [];
      const furtherDateItems: WeightedItem<T>[] = [];
      const currentDateItems = reversedWeights.filter((item, index) => {
        const itemDate = new Date(item.spacedRepetition.dueDate);

        if (itemDate.getTime() < new Date(currentDate).getTime()) {
          indexesToFilterOut.push(index);
          return true;
        }

        furtherDateItems.push(item);
        return false;
      });

      const filteredCulmulativeWeights = culmulativeWeights.filter((_, index) =>
        indexesToFilterOut.includes(index),
      );

      randomItems = findRandomWeightedItem({
        culmulativeWeights:
          currentDateItems.length > 0
            ? filteredCulmulativeWeights
            : culmulativeWeights,
        reversedWeights:
          currentDateItems.length > 0 ? currentDateItems : reversedWeights,
        numberOfItems,
        differentiateBy,
      });

      if (randomItems.length < numberOfItems) {
        randomItems = [
          ...randomItems,
          ...findRandomItem(
            furtherDateItems,
            numberOfItems - randomItems.length,
          ),
        ];
      }

      return {
        reversedWeights,
        randomItems,
        culmulativeWeights,
        min,
        max,
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

  useEffect(() => {
    if (!array.length || array.length === reversedWeights.length) return;
    const repetitionFrom = setArray ? setArray : array;

    const {
      reversedWeights: newReversedWeights,
      randomItems,
      culmulativeWeights,
    } = spaceRepetitionAlgorithm<T>({
      items: repetitionFrom,
      numberOfItems,
      differentiateBy,
    });

    setTodayItemsEnd(
      newReversedWeights.filter(
        (item) =>
          new Date(item.spacedRepetition.dueDate).getTime() - Date.now() < 0,
      ).length === 0,
    );

    setReversedWeights(newReversedWeights);
    setCulmulativeWeights(culmulativeWeights);

    if ((todayItemsEnd && continueReroll) || !todayItemsEnd) {
      setRandomItems(randomItems);
    }
  }, [
    array,
    setArray,
    numberOfItems,
    differentiateBy,
    todayItemsEnd,
    continueReroll,
  ]);

  const reroll = () => {
    const toFilter: number[] = [];
    const furtherDateItems: WeightedItem<T>[] = [];
    const currentDateItems = reversedWeights.filter((item, index) => {
      const itemDate = new Date(item.spacedRepetition.dueDate);

      if (itemDate.getTime() < Date.now()) {
        toFilter.push(index);
        return true;
      }

      furtherDateItems.push(item);
      return false;
    });

    const filteredCulmulativeWeights = culmulativeWeights.filter((_, index) =>
      toFilter.includes(index),
    );

    if (currentDateItems.length === 0) {
      setTodayItemsEnd(true);

      if (!continueReroll) {
        return [];
      } else {
        const randomItems = findRandomItem(reversedWeights, numberOfItems);

        setRandomItems(randomItems);

        return randomItems;
      }
    }

    const randomItems = findRandomWeightedItem({
      culmulativeWeights:
        currentDateItems.length > 0
          ? filteredCulmulativeWeights
          : culmulativeWeights,
      reversedWeights:
        currentDateItems.length > 0 ? currentDateItems : reversedWeights,
      numberOfItems,
      differentiateBy,
    });

    if (randomItems.length < numberOfItems) {
      const remainingItems = findRandomItem(
        furtherDateItems,
        numberOfItems - randomItems.length,
      );
      randomItems.push(...remainingItems);
    }

    setRandomItems(randomItems);

    return randomItems;
  };

  useEffect(() => {
    if (continueReroll) {
      reroll();
    }
  }, [continueReroll]);

  const calculateRepetition = (
    item: T,
    type: 'easy' | 'again' | 'good' | 'hard',
  ): T => {
    if (
      todayItemsEnd &&
      continueReroll &&
      (type === 'easy' || type === 'good')
    ) {
      return item;
    }

    const itemCopy = { ...item };
    const sr = itemCopy.spacedRepetition;

    // TODO: add this to settings page
    const spaceRepetitionConfig = {
      easy: 0.15,
      good: 0,
      hard: 0.1,
      again: 0.2,
    };

    const MIN_EASE_FACTOR = 1.3;
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
    const currentDate = new Date();

    const intervals = {
      again: 10 / (24 * 60), // 10 minutes in days
      hard: 1 / 24, // 1 hour in days
      good: 1, // 1 day
      easy: 7, // 1 week
    };

    const dynamicInterval = (baseInterval: number) => {
      const interval = Math.round(sr.interval * sr.easeFactor * baseInterval);
      return interval > 0
        ? Math.round(sr.interval * sr.easeFactor * baseInterval)
        : baseInterval;
    };
    switch (type) {
      case 'again':
        sr.interval = intervals.again; // ~10 minutes
        sr.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          sr.easeFactor - spaceRepetitionConfig.again,
        );
        break;

      case 'hard':
        sr.interval = dynamicInterval(intervals.hard); // ~1 hour
        sr.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          sr.easeFactor - spaceRepetitionConfig.hard,
        );
        break;

      case 'good':
        sr.interval = dynamicInterval(intervals.good); // ~1 day
        break;

      case 'easy':
        sr.interval = dynamicInterval(intervals.easy); // ~1 week
        sr.easeFactor = Math.max(
          MIN_EASE_FACTOR,
          sr.easeFactor + spaceRepetitionConfig.easy,
        );
        break;
    }

    sr.lastReviewAt = currentDate;
    sr.dueDate = new Date(currentDate.getTime() + sr.interval * ONE_DAY_IN_MS);
    sr.reviews += 1;

    setReversedWeights((prev) =>
      prev.map((mapItem) => {
        if (mapItem === item) {
          return { ...mapItem, spacedRepetition: sr };
        } else {
          return mapItem;
        }
      }),
    );

    return itemCopy;
  };

  return {
    reversedWeights,
    randomItems,
    reroll,
    calculateRepetition,
    continueReroll,
    setContinueReroll,
    todayItemsEnd,
  };
}
