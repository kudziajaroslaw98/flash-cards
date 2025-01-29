export type Reminder = {
  id: string;
  setFrontUuid: string; // References FlashcardSet.frontUuid
  days: WeekDay[]; // ['mon', 'tue', etc.]
  time: string; // "19:30"
  enabled: boolean;
};

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
