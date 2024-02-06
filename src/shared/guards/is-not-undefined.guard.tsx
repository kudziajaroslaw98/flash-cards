export default function isNotUndefined<T>(item: T | undefined): item is T {
  return item !== undefined;
}
