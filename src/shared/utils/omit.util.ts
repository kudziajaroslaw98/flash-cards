function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;

  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      result[key] = obj[key] as Omit<T, K>;
    }
  }

  return result as Omit<T, K>;
}

export default omit;
