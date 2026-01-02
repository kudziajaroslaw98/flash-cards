import { db } from '#/db/dexie.db';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { isAfter } from 'date-fns';
import { endOfToday } from 'date-fns/endOfToday';
import type { StateCreator } from 'zustand';
import type { AppState, RevisePlanSlice } from '../app-state';

export const createRevisePlanSlice: StateCreator<
  AppState,
  [],
  [],
  RevisePlanSlice
> = (set, get) => ({
  // Initial state
  reviseStage: 0,
  pickedStudyPlan: null,
  currentDay: null,
  currentSession: null,
  clicked: false,

  // Actions
  setReviseStage: (stage) => {
    set({ reviseStage: stage });
  },

  setPickedStudyPlan: (plan) => {
    set({ pickedStudyPlan: plan });
  },

  setCurrentDay: (day) => {
    set({ currentDay: day });
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  setClicked: (clicked) => {
    set({ clicked });
  },

  updateReviseStage: async (stage: number) => {
    const { currentSession, currentDay } = get();

    // If stage is 6, advance to next day
    if (stage === 6 && currentSession && currentDay) {
      await db.studySessions.update(currentSession.frontUuid, {
        currentDay: currentSession.currentDay + 1,
        nextRevisionDate: endOfToday().toUTCString(),
        stage: 1,
      });
      set({ reviseStage: 1 });
      return;
    }

    // Update stage if conditions are met
    if (
      stage !== 0 &&
      currentSession &&
      isAfter(new Date(), new Date(currentSession.nextRevisionDate))
    ) {
      await db.studySessions.update(currentSession.frontUuid, {
        stage: stage,
      });
    }

    set({ reviseStage: stage });
  },
});
