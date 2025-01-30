import { useEffect, useRef } from 'react';

export const useFocusTracker = () => {
  // eslint-disable-next-line no-undef
  const timerRef = useRef<NodeJS.Timeout>(null);
  const activeTime = useRef<number>(0);
  const distractions = useRef<number>(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        distractions.current += 1;
        clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        activeTime.current += 1;
      }, 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      clearInterval(timerRef.current!);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { activeTime, distractions };
};
