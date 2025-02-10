import type { FocusSession } from '#/types/focus-session.type';

export const getPeakFocusTimes = (sessions: FocusSession[], topN = 3) => {
  const hourlyMetrics: Record<number, { active: number; total: number }> = {};

  sessions.forEach((session) => {
    const hour = new Date(session.start).getHours();
    const sessionDuration =
      (new Date(session.end).getTime() - new Date(session.start).getTime()) /
      1000;

    if (!hourlyMetrics[hour]) {
      hourlyMetrics[hour] = { active: 0, total: 0 };
    }

    hourlyMetrics[hour].active += session.activeTime;
    hourlyMetrics[hour].total += sessionDuration;
  });

  return Object.entries(hourlyMetrics)
    .map(([hour, metrics]) => ({
      hour: parseInt(hour),
      ratio: metrics.total > 0 ? metrics.active / metrics.total : 0,
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, topN);
};
