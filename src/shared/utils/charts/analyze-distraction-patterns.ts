import type { FocusSession } from '#/types/focus-session.type';

export const analyzeDistractionPatterns = (
  sessions: FocusSession[],
): { hour: number; distractions: number }[] => {
  const hourlyDistractions = new Array(24).fill(0);

  sessions.forEach((session) => {
    const hour = new Date(session.start).getHours();
    hourlyDistractions[hour] += session.distractions;
  });

  return hourlyDistractions
    .map((distractions, hour) => ({
      hour,
      distractions,
    }))
    .sort((a, b) => a.hour - b.hour);
};
