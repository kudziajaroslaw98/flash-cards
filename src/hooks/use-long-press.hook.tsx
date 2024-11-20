import { isMouseEvent } from '#/shared/guards/is-mouse-event.guard';
import type { MouseEvent, TouchEvent } from 'react';
import { useCallback, useRef } from 'react';

export default function useLongPress<T, K = unknown>(
  longPressCallback: (value: T, e: MouseEvent | TouchEvent) => void,
  shortClickCallback: (
    value: K[],
    e: MouseEvent | TouchEvent,
  ) => void = () => {},
  longPressThreshold = 300,
): [
  (e: MouseEvent | TouchEvent, value: T) => void,
  (e: MouseEvent | TouchEvent, value?: K[]) => void,
  () => void,
] {
  const timerRef = useRef<number>(0);
  const clickLockRef = useRef<boolean>(false);

  const endTimer = () => {
    clearTimeout(timerRef.current || 0);
    timerRef.current = 0;
  };

  const onStartLongPress = useCallback(
    (e: MouseEvent | TouchEvent, value: T) => {
      // @ts-expect-error typescript for some reason expect generic type
      if (isMouseEvent(e) && e?.button !== 0) return;

      endTimer();
      clickLockRef.current = false;

      timerRef.current = window.setTimeout(() => {
        clickLockRef.current = true;
        longPressCallback(value, e);
        endTimer();
      }, longPressThreshold);
    },
    [longPressCallback, longPressThreshold],
  );

  const onEndLongPress = useCallback(
    (e: MouseEvent | TouchEvent, params?: K[]) => {
      // @ts-expect-error typescript for some reason expect generic type
      if (isMouseEvent(e) && e?.button !== 0) return;

      e.preventDefault();

      if (timerRef.current) {
        if (!clickLockRef.current) {
          if (params) {
            shortClickCallback([...params], e);
          } else {
            shortClickCallback([], e);
          }
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
