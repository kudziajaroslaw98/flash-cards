import { MouseEvent, TouchEvent, useCallback, useRef } from 'react';

export default function useLongPress<T>(
  // callback that is invoked at the specified duration or `onEndLongPress`
  longPressCallback: (value?: T) => void,
  shortClickCallback: () => void = () => {},
  // long press duration in milliseconds
  longPressThreshold = 300,
): [(value?: T) => void, (e: MouseEvent | TouchEvent) => void, () => void] {
  // used to persist the timer state
  // non zero values means the value has never been fired before
  const timerRef = useRef<number>(0);
  const clickLockRef = useRef<boolean>(false);

  // clear timed callback
  const endTimer = () => {
    clearTimeout(timerRef.current || 0);
    timerRef.current = 0;
  };

  // init timer
  const onStartLongPress = useCallback(
    (value?: T) => {
      // stop any previously set timers
      endTimer();
      clickLockRef.current = false;

      // set new timeout
      timerRef.current = window.setTimeout(() => {
        clickLockRef.current = true;
        longPressCallback(value);
        endTimer();
      }, longPressThreshold);
    },
    [longPressCallback, longPressThreshold],
  );

  // determine to end timer early and invoke the callback or do nothing
  const onEndLongPress = useCallback(
    (e: MouseEvent | TouchEvent) => {
      // run the callback fn the timer hasn't gone off yet (non zero)
      e.preventDefault();
      if (timerRef.current) {
        if (!clickLockRef.current) {
          shortClickCallback();
        }
        endTimer();
      }
    },
    [shortClickCallback],
  );

  const onClickAndMove = useCallback(() => {
    // run the callback fn the timer hasn't gone off yet (non zero)
    if (timerRef.current) {
      endTimer();
    }
  }, []);

  return [onStartLongPress, onEndLongPress, onClickAndMove];
}
