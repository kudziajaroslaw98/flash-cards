export type FocusSession = {
  frontUuid: string;
  timestamp: Date | string;
  start: Date | string;
  end: Date | string;
  activeTime: number; // in seconds
  distractions: number;
  synced: boolean;
};
