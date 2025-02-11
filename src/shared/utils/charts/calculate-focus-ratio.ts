import type { FocusSession } from '#/types/focus-session.type';
import { resetMiliseconds } from '../reset-date-miliseconds';

export const calculateFocusRatio = (
  sessions: FocusSession[],
): { ratio: number; totalActive: number; totalTime: number } => {
  let totalActive = 0;
  let totalTime = 0;

  sessions.forEach((session) => {
    const start = resetMiliseconds(new Date(session.start));
    const end = resetMiliseconds(new Date(session.end));
    const sessionDuration = (end.getTime() - start.getTime()) / 1000; // in seconds
    totalActive += session.activeTime;
    totalTime += sessionDuration;
  });

  return {
    ratio: totalTime > 0 ? totalActive / totalTime : 0,
    totalActive,
    totalTime,
  };
};
