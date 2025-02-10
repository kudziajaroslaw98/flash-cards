import type { FocusSession } from '#/types/focus-session.type';

export const getWeeklyFocusTrends = (sessions: FocusSession[]) => {
  const dailyMetrics: Record<string, { active: number; total: number }> = {};

  sessions.forEach((session) => {
    const date = new Date(session.start);
    const day = (date.getDay() - 1 + 7) % 7;
    const sessionDuration =
      (new Date(session.end).getTime() - date.getTime()) / 1000;

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
