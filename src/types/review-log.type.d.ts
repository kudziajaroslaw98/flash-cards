export type reviewLog = {
  card_id: 'string';
  correct: boolean;
  time_spent: number; // 4.5 seconds
  timestamp: Date | string;
  tags: string[];
  session_id: 'string';
};
