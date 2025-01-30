export type ReviewLog = {
  timestamp: Date | string;
  sessionUuid: string;
  cardFrontUuid: string;
  recalled: boolean;
  timeSpent: number; // 4.5 seconds
  tags: string[];
  synced: boolean;
};
