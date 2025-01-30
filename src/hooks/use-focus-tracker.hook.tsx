import { useEffect, useRef, useState } from 'react';

export const useFocusTracker = () => {
  const [activeTime, setActiveTime] = useState(0);
  const [distractions, setDistractions] = useState(0);
  // eslint-disable-next-line no-undef
  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        setDistractions((prev) => prev + 1);
        clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setActiveTime((prev) => prev + 1);
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
