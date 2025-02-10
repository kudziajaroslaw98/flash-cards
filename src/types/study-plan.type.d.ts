import type { StudyDay } from './study-day.type';
export type StudyPlan = {
  durationDays: number;
  days: StudyDay[];
  focusTags: string[];
  totalCards: number;
};
