import { useEffect, useRef, useState } from 'react';

export const useFocusTracker = () => {
  // eslint-disable-next-line no-undef
  const timerStart = useRef<Date | null>(null);
  const distractionsRef = useRef<number>(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    timerStart.current = new Date();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        distractionsRef.current += 1;
        setDistractions((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { timerStart, distractionsRef, distractions };
};
