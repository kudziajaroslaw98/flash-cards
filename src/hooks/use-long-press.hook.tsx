import { useCallback, useRef } from 'react';

export default function useLongPress<T>(
  // callback that is invoked at the specified duration or `onEndLongPress`
  callback: (value?: T) => void,
  endCallback: () => void,
  // long press duration in milliseconds
  ms = 500,
) {
  // used to persist the timer state
  // non zero values means the value has never been fired before
  const timerRef = useRef<number>(0);

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

      // set new timeout
      timerRef.current = window.setTimeout(() => {
        callback(value);
        endTimer();
      }, ms);
    },
    [callback, ms],
  );

  // determine to end timer early and invoke the callback or do nothing
  const onEndLongPress = useCallback(() => {
    // run the callback fn the timer hasn't gone off yet (non zero)
    if (timerRef.current) {
      endTimer();
      endCallback();
    }
  }, []);

  return [onStartLongPress, onEndLongPress, endTimer];
}
