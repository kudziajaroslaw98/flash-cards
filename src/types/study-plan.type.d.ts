import type { StudyDay } from './study-day.type';
export type StudyPlan = {
  id: string;
  durationDays: number;
  days: StudyDay[];
  focusTags: string[];
  totalCards: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  synced: boolean;
};
