import { useCallback, useRef } from 'react';

export default function useDebounce(
  func: (...args: any[]) => void,
  wait: number,
) {
  const timeout = useRef<any>();

  return useCallback(
    (...args: any[]) => {
      const later = () => {
        clearTimeout(timeout.current);
        func();
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait],
  );
}
