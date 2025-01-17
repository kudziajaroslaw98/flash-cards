export default function extendedIncludes<T>(arr: T[], value: T | T[]): boolean {
  if (Array.isArray(value)) {
    return arr.some((item) => value.includes(item));
  }
  return arr.includes(value);
}

Object.defineProperty(Array.prototype, 'extendedIncludes', {
  value: function <T>(value: T | T[]): boolean {
    return extendedIncludes(this, value);
  },
  enumerable: false, // Prevents it from appearing in loops
  configurable: true,
  writable: true,
});
