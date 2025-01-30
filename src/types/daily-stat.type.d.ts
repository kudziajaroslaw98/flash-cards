export type DailyStat = {
  date: string;
  retention: number;
  cardsReviewed: number;
  cardsRecalled: number;
  timeSpent: number; // in seconds
};
