import type { FocusSession } from '#/types/focus-session.type';
import { resetMiliseconds } from '../reset-date-miliseconds';

export const getWeeklyFocusTrends = (sessions: FocusSession[]) => {
  const dailyMetrics: Record<string, { active: number; total: number }> = {};

  sessions.forEach((session) => {
    const start = resetMiliseconds(new Date(session.start));
    const end = resetMiliseconds(new Date(session.end));
    const day = (start.getDay() - 1 + 7) % 7;
    const sessionDuration = (end.getTime() - start.getTime()) / 1000;

    if (!dailyMetrics[day]) {
      dailyMetrics[day] = { active: 0, total: 0 };
    }

    dailyMetrics[day].active += session.activeTime;
    dailyMetrics[day].total += sessionDuration;
  });

  return Object.entries(dailyMetrics).map(([day, metrics]) => ({
    day,
    ratio: metrics.total > 0 ? metrics.active / metrics.total : 0,
    active: metrics.active,
    total: metrics.total,
  }));
};
