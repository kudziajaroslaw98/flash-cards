import { useEffect, useRef, useState } from 'react';

export const useFocusTracker = () => {
  // eslint-disable-next-line no-undef
  const timerRef = useRef<NodeJS.Timeout>(null);
  const timerStart = useRef<Date | null>(null);
  const distractionsRef = useRef<number>(0);
  const [activeTime, setActiveTime] = useState(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    timerStart.current = new Date();
    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        distractionsRef.current += 1;
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

  return { timerStart, distractionsRef, activeTime, distractions };
};
