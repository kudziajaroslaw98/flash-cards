export function splitArrayIntoChunks<T>(
  array: T[],
  chunkSize: number = 4,
): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
