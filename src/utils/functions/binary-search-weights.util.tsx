export default function binarySearch(
  arrayOfNumbers: number[],
  randomFloat: number,
  start = 0,
  end = arrayOfNumbers.length,
): number {
  if (end < start) {
    return -1;
  } else if (end == start) {
    return end;
  }

  const mid = Math.floor((start + end) / 2);

  if (arrayOfNumbers[mid] === randomFloat) {
    return mid + 1;
  } else if (arrayOfNumbers[mid] < randomFloat) {
    return binarySearch(arrayOfNumbers, randomFloat, mid + 1, end);
  } else {
    return binarySearch(arrayOfNumbers, randomFloat, start, mid);
  }
}
