import type { ReviewLog } from '#/types/review-log.type';

self.onmessage = async (event: MessageEvent) => {
  if (event.data.action === 'heatmap') {
    const reviewLogs = event.data.items as ReviewLog[];
    const hourlyCounts = new Map<string, { total: number; recalled: number }>();

    reviewLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const day = (date.getDay() - 1 + 7) % 7;
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      // Count total reviews and successful recalls
      if (!hourlyCounts.has(key)) {
        hourlyCounts.set(key, { total: 0, recalled: 0 });
      }

      const counts = hourlyCounts.get(key)!;
      counts.total++;
      if (log.recalled) counts.recalled++;
    });

    // Convert to heatmap format with retention rate
    const processedData = Array.from(hourlyCounts.entries()).map(
      ([key, counts]) => {
        const [day, hour] = key.split('-').map(Number);
        return {
          x: hour,
          y: day,
          value: counts.total > 0 ? counts.recalled / counts.total : 0,
          total: counts.total,
          recalled: counts.recalled,
        };
      },
    );

    self.postMessage({ processedData });
  }
};
