export function extendedIncludes<T>(arr: T[], value: T | T[]): boolean {
  if (Array.isArray(value)) {
    return arr.some((item) => value.includes(item));
  }
  return arr.includes(value);
}

export function onFirst<T>(arr: T[], value: T): T | undefined {
  for (const item of arr) {
    if (item === value) {
      return item;
    }
  }
}

Object.defineProperty(Array.prototype, 'extendedIncludes', {
  value: function <T>(value: T | T[]): boolean {
    return extendedIncludes(this, value);
  },
  enumerable: false, // Prevents it from appearing in loops
  configurable: true,
  writable: true,
});

Object.defineProperty(Array.prototype, 'onFirst', {
  value: function <T>(value: T): T | undefined {
    return onFirst(this, value);
  },
  enumerable: false, // Prevents it from appearing in loops
  configurable: true,
  writable: true,
});
