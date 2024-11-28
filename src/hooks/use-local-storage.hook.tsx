'use client';

import { useEffect, useState } from 'react';

export interface UseLocalStorageOutput<T, K extends Record<string, T>> {
  value: K;
  arrayOfValues: T[];
  setToLocalStorage: (_value: K) => void;
  initiated: boolean;
}

type useLocalStorageProp<T, K extends Record<string, T>> = {
  key: string;
  defaultValue?: K;
  sortStrategy?: (_head: T, _tail: T) => number;
  setValue?: (_value: K) => void;
  setArrayValue?: (_value: T[]) => void;
};

export default function useLocalStorage<T, K extends Record<string, T>>({
  key,
  defaultValue,
  sortStrategy,
  setValue,
  setArrayValue,
}: useLocalStorageProp<T, K>): UseLocalStorageOutput<T, K> {
  const [json, setJSON] = useState<K | undefined>(defaultValue || undefined);
  const [array, setArray] = useState<T[]>([]);
  const [initiated, setInitiated] = useState(false);

  const setToLocalStorage = (value: K) => {
    window.localStorage.setItem(key, JSON.stringify(value));

    setJSON(value);
  };

  useEffect(() => {
    if (window && window?.localStorage) {
      const localStorageValue = window.localStorage.getItem(key);
      let value = defaultValue ?? ({} as K);

      if (localStorageValue === null) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      } else {
        value = JSON.parse(localStorageValue) as K;
      }

      setJSON(value);
      if (setValue) {
        setValue(value);
      }
    }
  }, []);

  useEffect(() => {
    if (!defaultValue) return;
    const validJson = json as K;
    let array = [] as T[];

    if (sortStrategy) {
      array = Object.values(validJson).sort((head, tail) =>
        sortStrategy(head, tail),
      );
    } else {
      array = Object.values(validJson);
    }

    setArray(array);
    if (setArrayValue) {
      setArrayValue(array);
    }

    setInitiated(true);
  }, [json]);

  return {
    value: json as K,
    arrayOfValues: array,
    setToLocalStorage,
    initiated,
  };
}
