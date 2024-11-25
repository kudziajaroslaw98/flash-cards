'use client';

import { useEffect, useState } from 'react';

export interface UseLocalStorageOutput<T, K extends Record<string, T>> {
  value: K;
  arrayOfValues: T[];
  setToLocalStorage: (_value: K) => void;
}

export default function useLocalStorage<T, K extends Record<string, T>>(
  key: string,
  defaultValue?: K,
  sortStrategy?: (_head: T, _tail: T) => number,
): UseLocalStorageOutput<T, K> {
  const [json, setJSON] = useState<K | undefined>(defaultValue || undefined);
  const [array, setArray] = useState<T[]>([]);

  const setToLocalStorage = (value: K) => {
    window.localStorage.setItem(key, JSON.stringify(value));

    setJSON(value);
  };

  useEffect(() => {
    if (window && window?.localStorage) {
      const localStorageValue = window.localStorage.getItem(key);

      if (localStorageValue === null) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        setJSON(defaultValue);

        return;
      }

      const parsedJSON = JSON.parse(localStorageValue) as K;
      setJSON(parsedJSON);
    }
  }, []);

  useEffect(() => {
    if (!defaultValue) return;
    const validJson = json as K;

    if (sortStrategy) {
      setArray(
        Object.values(validJson).sort((head, tail) => sortStrategy(head, tail)),
      );
    } else {
      setArray(Object.values(validJson));
    }
  }, [json]);

  return { value: json as K, arrayOfValues: array, setToLocalStorage };
}
