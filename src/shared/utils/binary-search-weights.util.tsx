export default function binarySearch(
  arrayOfNumbers: number[],
  randomNumber: number,
  start = 0,
  end = arrayOfNumbers.length,
): number {
  if (end < start) {
    return -1;
  } else if (end == start) {
    return end;
  }

  const mid = Math.floor((start + end) / 2);

  if (arrayOfNumbers[mid] === randomNumber) {
    return mid + 1;
  } else if (arrayOfNumbers[mid] < randomNumber) {
    return binarySearch(arrayOfNumbers, randomNumber, mid + 1, end);
  } else {
    return binarySearch(arrayOfNumbers, randomNumber, start, mid);
  }
}
