import { db } from '#/db/dexie.db';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StateCreator } from 'zustand';
import type { AppState, StudyPlansSlice } from '../app-state';

export const createStudyPlansSlice: StateCreator<
  AppState,
  [],
  [],
  StudyPlansSlice
> = () => ({
  // Actions
  removeStudyPlans: async (plans: StudyPlan[]) => {
    const plansToDelete: string[] = plans.map((item) => item.frontUuid);

    // Remove study sessions
    const studySessions = await db.studySessions
      .where('planId')
      .anyOf(plansToDelete)
      .toArray();
    await db.studySessions.bulkDelete(
      studySessions.map((item) => item.frontUuid)
    );

    // Remove study days
    const studyDays = await db.studyDays
      .where('planId')
      .anyOf(plansToDelete)
      .toArray();
    await db.studyDays.bulkDelete(studyDays.map((item) => item.frontUuid));

    // Remove study plans
    await db.studyPlans.bulkDelete(plansToDelete);

    // TODO: Add supabase delete when ready
  },
});
