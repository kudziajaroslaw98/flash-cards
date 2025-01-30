export type FocusSession = {
  uuid: string;
  start: Date | string;
  end: Date | string;
  activeTime: number; // in seconds
  distractions: number;
  synced: boolean;
};
