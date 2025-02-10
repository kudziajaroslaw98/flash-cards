export type DailyStat = {
  updatedAt: string;
  frontUuid: string;
  date: string;
  retention: number;
  cardsReviewed: number;
  cardsRecalled: number;
  timeSpent: number; // in seconds
  synced: boolean;
};
