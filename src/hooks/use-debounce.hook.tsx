import { useCallback, useRef } from 'react';

export default function useDebounce(
  func: (...args: unknown[]) => void,
  wait: number,
) {
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: unknown[]) => {
      const later = () => {
        clearTimeout(timeout.current);
        func(...args);
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait],
  );
}
