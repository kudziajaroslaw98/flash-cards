export {};

declare global {
  interface Array<T> {
    extendedIncludes(value: T | T[]): boolean;
  }
}
