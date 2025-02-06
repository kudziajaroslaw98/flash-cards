export type Reminder = {
  frontUuid: string;
  setFrontUuid: string; // References FlashcardSet.frontUuid
  start: string; // Start time of the reminder, in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.SSSZ). For example, "2023-05-17T10:00:00.000+02:00" for 10:00 AM on May 17, 2023 (CET).
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  synced: boolean;
};

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
