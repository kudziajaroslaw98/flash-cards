import type { FocusSession } from '#/types/focus-session.type';

export const calculateFocusRatio = (
  sessions: FocusSession[],
): { ratio: number; totalActive: number; totalTime: number } => {
  let totalActive = 0;
  let totalTime = 0;

  sessions.forEach((session) => {
    const start = new Date(session.start);
    const end = new Date(session.end);
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
