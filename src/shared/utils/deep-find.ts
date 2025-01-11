import type { DotNestedKeys } from '#/types/dot-nested-keys.type';

export function deepFind<T>(
  obj: Record<keyof T, unknown>,
  path: DotNestedKeys<T>,
) {
  // @ts-expect-error typescript
  return path.split('.').reduce((a, v) => (a ? a[v] : undefined), obj);
}
