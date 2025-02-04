import type { FocusSession } from '#/types/focus-session.type';

export const calculateFocusRatio = (
  sessions: FocusSession[],
): { ratio: number; totalActive: number; totalTime: number } => {
  let totalActive = 0;
  let totalTime = 0;

  sessions.forEach((session) => {
    const start = new Date(new Date(session.start).setMilliseconds(0));
    const end = new Date(new Date(session.end).setMilliseconds(0));
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
