import type { StudyDay } from './study-day.type';
export type StudyPlan = {
  frontUuid: string;
  durationDays: number;
  name: string;
  days: StudyDay[];
  focusTags: string[];
  totalCards: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  synced: boolean;
};
