import type { DotNestedKeys } from '#/types/dot-nested-keys.type';
import { deepFind } from './deep-find';

export default function binarySearch<T>(
  array: T[],
  differentiateBy: DotNestedKeys<T>,
  randomNumber: number,
  start = 0,
  end = array.length,
): number {
  if (end < start) {
    return -1;
  } else if (end == start) {
    return end;
  }

  const mid = Math.floor((start + end) / 2);

  if (
    (deepFind<T>(array[mid] as T, differentiateBy) as number) === randomNumber
  ) {
    return mid + 1;
  } else if (
    (deepFind<T>(array[mid] as T, differentiateBy) as number) < randomNumber
  ) {
    return binarySearch(array, differentiateBy, randomNumber, mid + 1, end);
  } else {
    return binarySearch(array, differentiateBy, randomNumber, start, mid);
  }
}
