'use client';

import { useEffect, useState } from 'react';

export interface UseLocalStorageOutput<T, K extends Record<string, T>> {
  value: K;
  arrayOfValues: T[];
  setToLocalStorage: (value: K) => void;
}

export default function useLocalStorage<T, K extends Record<string, T>>(
  key: string,
  defaultValue: K,
  sortStrategy?: (head: T, tail: T) => number,
): UseLocalStorageOutput<T, K> {
  const [json, setJSON] = useState<K>(defaultValue);
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
    if (sortStrategy) {
      setArray(
        Object.values(json).sort((head, tail) => sortStrategy(head, tail)),
      );
    } else {
      setArray(Object.values(json));
    }
  }, [json]);

  return { value: json, arrayOfValues: array, setToLocalStorage };
}
