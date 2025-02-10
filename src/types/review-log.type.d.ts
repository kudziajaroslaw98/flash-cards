export type ReviewLog = {
  frontUuid: string;
  timestamp: Date | string;
  sessionUuid: string;
  cardFrontUuid: string;
  recalled: boolean;
  timeSpent: number; // 4.5 seconds
  tags: string[];
  synced: boolean;
};
