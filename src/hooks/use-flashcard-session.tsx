import { db } from '#/db/dexie.db';
import uuid from '#/shared/utils/uuid.util';
import { FocusSession } from '#/types/focus-session.type';
import { useCallback, useEffect, useRef } from 'react';
import { useFocusTracker } from './use-focus-tracker.hook';

export function useFlashcardSession() {
  const cardsReviewed = useRef(0);
  const cardsRecalled = useRef(0);
  const cardTime = useRef<Date>(new Date());
  const focusSession = useRef<FocusSession>({
    frontUuid: uuid(),
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    activeTime: 0,
    distractions: 0,
    synced: false,
    timestamp: new Date().toISOString(),
  });

  const { timerStart, distractionsRef } = useFocusTracker();

  // Save session data on component unmount
  useEffect(() => {
    return () => {
      if (!focusSession.current || timerStart.current === null) return;

      const now = new Date();
      const sessionActiveTime = timerStart.current
        ? (now.setMilliseconds(0) - timerStart.current.setMilliseconds(0)) /
          1000
        : 0;

      db.focusSessions.put({
        ...focusSession.current,
        timestamp: new Date().toISOString(),
        end: new Date().toISOString(),
        activeTime: sessionActiveTime,
        distractions: distractionsRef.current,
      });

      // Update daily stats
      const updateDailyStats = async () => {
        const dailyStat = await db.dailyStats.get(
          new Date().toISOString().split('T')[0],
        );

        if (dailyStat) {
          db.dailyStats.put({
            ...dailyStat,
            date: new Date().toISOString().split('T')[0],
            retention: parseFloat(
              (
                (dailyStat.cardsRecalled + cardsRecalled.current) /
                (dailyStat.cardsReviewed + cardsReviewed.current)
              ).toFixed(2),
            ),
            cardsReviewed: dailyStat.cardsReviewed + cardsReviewed.current,
            cardsRecalled: dailyStat.cardsRecalled + cardsRecalled.current,
            timeSpent: dailyStat.timeSpent + sessionActiveTime,
            synced: false,
          });
        } else {
          db.dailyStats.put({
            updatedAt: new Date().toISOString(),
            frontUuid: uuid(),
            date: new Date().toISOString().split('T')[0],
            retention:
              cardsReviewed.current > 0
                ? parseFloat(
                    (cardsRecalled.current / cardsReviewed.current).toFixed(2),
                  )
                : 0,
            cardsReviewed: cardsReviewed.current,
            cardsRecalled: cardsRecalled.current,
            timeSpent: sessionActiveTime,
            synced: false,
          });
        }
      };

      updateDailyStats();
    };
  }, [distractionsRef, timerStart]);

  const startCardTimer = useCallback(() => {
    cardTime.current = new Date();
  }, []);

  return {
    cardsReviewed,
    cardsRecalled,
    focusSession,
    cardTime,
    timerStart,
    startCardTimer,
    incrementRecalled: () => {
      cardsRecalled.current += 1;
    },
    incrementReviewed: () => {
      cardsReviewed.current += 1;
    },
  };
}
