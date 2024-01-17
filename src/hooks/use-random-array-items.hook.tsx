import { useEffect, useRef, useState } from 'react';

import addUpNumberArray from '#/utils/functions/add-up-number-array.util';
import binarySearch from '#/utils/functions/binary-search-weights.util';
import getRandomRangedFloat from '#/utils/functions/get-random-ranged-float';

export interface UseRandomArrayItemsOutput<T> {
  pickedItems: T[];
  reshuffle: () => void;
}

export default function useRandomArrayItems<T>(
  array: T[],
  weightsArray: number[],
  itemsCount: number,
): UseRandomArrayItemsOutput<T> {
  const [pickedItems, setPickedItems] = useState<T[]>([]);
  const currentArrayLength = useRef(0);

  const reshuffle = () => {
    const pickedItemsTmp: T[] = [];
    const summedWeights = addUpNumberArray(weightsArray);

    console.log(array.length <= itemsCount);

    if (array.length <= itemsCount) {
      pickedItemsTmp.push(...array);
    } else {
      for (let i = 0; i <= itemsCount - 1; i++) {
        let item = null;

        do {
          const index = binarySearch(
            summedWeights,
            getRandomRangedFloat(
              summedWeights[0],
              summedWeights[summedWeights.length - 1],
            ),
          );
          item = array[index];
        } while (!item || pickedItemsTmp.includes(item) || item === null);

        pickedItemsTmp.push(item);
      }
    }

    currentArrayLength.current = array.length;
    setPickedItems(pickedItemsTmp);
  };

  useEffect(() => {
    if (
      pickedItems.length === itemsCount ||
      array.length === 0 ||
      array.length === currentArrayLength.current
    ) {
      return;
    }

    reshuffle();
  }, [array]);

  return { pickedItems, reshuffle };
}
