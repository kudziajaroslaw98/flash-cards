'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export interface UseLocalStorageOutput<T, K extends Record<string, T>> {
  value: K;
  arrayOfValues: T[];
  setToLocalStorage: (_value: K | T) => void;
  initiated: boolean;
}

type useLocalStorageProp<T, K extends Record<string, T>> = {
  key: string;
  defaultValue?: T | K;
  sortStrategy?: (_head: T, _tail: T) => number;
  setValue?: Dispatch<SetStateAction<T>> | Dispatch<SetStateAction<K>>;
  setArrayValue?: (_value: T[]) => void;
};

export default function useLocalStorage<T, K extends Record<string, T>>({
  key,
  defaultValue,
  sortStrategy,
  setValue,
  setArrayValue,
}: useLocalStorageProp<T, K>): UseLocalStorageOutput<T, K> {
  const [json, setJSON] = useState<T | K | undefined>(
    defaultValue || undefined,
  );
  const [array, setArray] = useState<T[]>([]);
  const [initiated, setInitiated] = useState(false);

  const setToLocalStorage = (value: K | T) => {
    window.localStorage.setItem(key, JSON.stringify(value));

    setJSON(value);
  };

  useEffect(() => {
    if (window && window?.localStorage) {
      const localStorageValue = window.localStorage.getItem(key);
      let value = defaultValue ?? ({} as K);
      let array = [] as T[];

      if (localStorageValue === null && defaultValue) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      } else if (localStorageValue !== null) {
        value = JSON.parse(localStorageValue);
      }

      setJSON(value);
      if (setValue) {
        setValue(value as SetStateAction<K> & SetStateAction<T>);
      }

      if (sortStrategy) {
        array = Object.values(value).sort((head, tail) =>
          sortStrategy(head, tail),
        );
      } else {
        array = Object.values(value);
      }

      setArray(array);
      if (setArrayValue) {
        setArrayValue(array);
      }

      setInitiated(true);
    }
  }, []);

  return {
    value: json as K,
    arrayOfValues: array,
    setToLocalStorage,
    initiated,
  };
}
