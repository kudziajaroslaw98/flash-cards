export const isDifferent = (a: unknown, b: unknown): boolean => {
  if (a === b) return false;

  // Check if both values are arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return true;

    return a.some((val, index) => isDifferent(val, b[index]));
  }

  // Check if both values are objects (but not null)
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const objectA = a as Record<string, unknown>;
    const objectB = b as Record<string, unknown>;

    if (JSON.stringify(objectA) === '{}' && JSON.stringify(objectB) === '{}')
      return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return true;

    return aKeys.some((key) => isDifferent(objectA[key], objectB[key]));
  }

  // Default case: treat as primitives or different types
  return true;
};
