/**
 * Creates a new object by omitting specified keys from an input object.
 *
 * @template T The type of the input object.
 * @template K The keys to omit from the object.
 * @param {T} obj The object to omit keys from.
 * @param {K[]} keys An array of keys to omit.
 * @returns {Omit<T, K>} A new object with the specified keys omitted.
 */
function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

export default omit;
