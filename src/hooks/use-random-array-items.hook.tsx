import { useCallback, useEffect, useRef, useState } from 'react';

import addUpNumberArray from '#/shared/utils/add-up-number-array.util';
import binarySearch from '#/shared/utils/binary-search-weights.util';
import getRandomRangedFloat from '#/shared/utils/get-random-ranged-float';

export interface UseRandomArrayItemsOutput<T> {
  pickedItems: T[];
  reshuffle: () => void;
  setNewArray: (array: T[]) => void;
}

export default function useRandomArrayItems<T extends { weight: number }>(
  initialArray: T[],
  itemsCount: number,
): UseRandomArrayItemsOutput<T> {
  const weightsArrayRef = useRef<number[]>(
    initialArray.map((item) => item.weight).sort(),
  );
  const arrayRef = useRef<T[]>(initialArray);
  const [pickedItems, setPickedItems] = useState<T[]>([]);
  const currentArrayLength = useRef(0);

  const reshuffle = useCallback(() => {
    const pickedItemsTmp: T[] = [];
    const summedWeights = addUpNumberArray(weightsArrayRef.current);

    if (arrayRef.current.length <= itemsCount) {
      pickedItemsTmp.push(...arrayRef.current);
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
          item = arrayRef.current[index];
        } while (!item || pickedItemsTmp.includes(item) || item === null);

        pickedItemsTmp.push(item);
      }
    }

    currentArrayLength.current = arrayRef.current.length;
    setPickedItems(pickedItemsTmp);
  }, [itemsCount]);

  const setNewArray = (array: T[]) => {
    arrayRef.current = array;
    weightsArrayRef.current = array.map((item) => item.weight).sort();
  };

  useEffect(() => {
    if (
      pickedItems.length === itemsCount ||
      arrayRef.current.length === 0 ||
      arrayRef.current.length === currentArrayLength.current
    ) {
      return;
    }

    reshuffle();
  }, [itemsCount, pickedItems, reshuffle]);

  return { pickedItems, reshuffle, setNewArray };
}
