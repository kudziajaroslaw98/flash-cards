import type { FocusSession } from '#/types/focus-session.type';
import { resetMiliseconds } from '../reset-date-miliseconds';

export const getPeakFocusTimes = (sessions: FocusSession[], topN = 3) => {
  const hourlyMetrics: Record<number, { active: number; total: number }> = {};

  sessions.forEach((session) => {
    const hour = new Date(session.start).getHours();
    const start = resetMiliseconds(new Date(session.start));
    const end = resetMiliseconds(new Date(session.end));
    const sessionDuration = (end.getTime() - start.getTime()) / 1000;

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
