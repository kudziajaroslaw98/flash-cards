import { useCallback, useRef } from 'react';

export default function useLongPress<T>(
  // callback that is invoked at the specified duration or `onEndLongPress`
  longPressCallback: (value?: T) => void,
  shortClickCallback: (value?: T) => void = () => {},
  // long press duration in milliseconds
  longPressThreshold = 300,
) {
  // used to persist the timer state
  // non zero values means the value has never been fired before
  const timerRef = useRef<number>(0);
  const clickLockRef = useRef<boolean>(false);

  // clear timed callback
  const endTimer = () => {
    clearTimeout(timerRef.current || 0);
    timerRef.current = 0;
    clickLockRef.current = false;
  };

  // init timer
  const onStartLongPress = useCallback(
    (value?: T) => {
      // stop any previously set timers
      endTimer();

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
    (value?: T) => {
      // run the callback fn the timer hasn't gone off yet (non zero)
      if (timerRef.current) {
        if (!clickLockRef.current) {
          shortClickCallback(value);
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

  return [onStartLongPress, onEndLongPress, onClickAndMove, endTimer];
}
