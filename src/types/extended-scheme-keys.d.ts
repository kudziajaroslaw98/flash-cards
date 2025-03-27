export type ExtendedSchemeKeys<T> = (keyof T & string) | `_internal_${string}`;
