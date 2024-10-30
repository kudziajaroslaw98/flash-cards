import { MouseEvent, TouchEvent, useCallback, useRef } from 'react';

export default function useLongPress<T, K = unknown>(
  longPressCallback: (value: T) => void,
  shortClickCallback: (...params: K[]) => void = () => {},
  longPressThreshold = 300,
): [
  (value: T) => void,
  (e: MouseEvent | TouchEvent, ...params: K[]) => void,
  () => void,
] {
  const timerRef = useRef<number>(0);
  const clickLockRef = useRef<boolean>(false);

  const endTimer = () => {
    clearTimeout(timerRef.current || 0);
    timerRef.current = 0;
  };

  const onStartLongPress = useCallback(
    (value: T) => {
      endTimer();
      clickLockRef.current = false;

      timerRef.current = window.setTimeout(() => {
        clickLockRef.current = true;
        longPressCallback(value);
        endTimer();
      }, longPressThreshold);
    },
    [longPressCallback, longPressThreshold],
  );

  const onEndLongPress = useCallback(
    (e: MouseEvent | TouchEvent, ...params: K[]) => {
      e.preventDefault();

      if (timerRef.current) {
        if (!clickLockRef.current) {
          shortClickCallback(...params);
        }
        endTimer();
      }
    },
    [shortClickCallback],
  );

  const onClickAndMove = useCallback(() => {
    if (timerRef.current) {
      endTimer();
    }
  }, []);

  return [onStartLongPress, onEndLongPress, onClickAndMove];
}
