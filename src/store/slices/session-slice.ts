import { db } from '#/db/dexie.db';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { createClient } from '#/shared/utils/supabase/client';
import type { ApiResponse } from '#/types/api-response.type';
import type { UserAttributes } from '@supabase/supabase-js';
import type { StateCreator } from 'zustand';
import type { AppState, SessionSlice } from '../app-state';

export const createSessionSlice: StateCreator<
  AppState,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  // Initial state
  user: null,
  isLoggedIn: false,
  pickedPlan: null,
  isPlanActive: false,

  // Actions
  setUser: (user) => {
    set({
      user,
      isLoggedIn: user !== null,
      pickedPlan: user?.user_metadata?.stripe_subscribed_plan ?? null,
      isPlanActive:
        user?.user_metadata?.stripe_subscription_status === 'active',
    });
  },

  logOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear all local data
    await Promise.all([
      db.flashcards.clear(),
      db.sets.clear(),
      db.metadata.update('current', defaultMetadata),
      db.dailyStats.clear(),
      db.focusSessions.clear(),
      db.reviewLogs.clear(),
      db.studyPlans.clear(),
      db.studyDays.clear(),
      db.studySessions.clear(),
      db.reminders.clear(),
    ]);

    set({
      user: null,
      isLoggedIn: false,
      pickedPlan: null,
      isPlanActive: false,
    });

    window.location.reload();
  },

  updateUser: async (userAttributes: UserAttributes) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser(userAttributes);

    if (data.user !== null && error === null) {
      set({
        user: data.user,
        pickedPlan: data.user?.user_metadata?.stripe_subscribed_plan ?? null,
        isPlanActive:
          data.user?.user_metadata?.stripe_subscription_status === 'active',
      });
    }
  },

  deleteUser: async () => {
    const response: ApiResponse<unknown> = await fetch(API_ROUTES.USER_DELETE, {
      method: 'GET',
    }).then((res) => res.json());

    if (response.success) {
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear all local data
      await Promise.all([
        db.flashcards.clear(),
        db.sets.clear(),
        db.metadata.update('current', defaultMetadata),
        db.dailyStats.clear(),
        db.focusSessions.clear(),
        db.reviewLogs.clear(),
      ]);

      set({
        user: null,
        isLoggedIn: false,
        pickedPlan: null,
        isPlanActive: false,
      });

      window.location.reload();
    }
  },

  checkSession: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    get().setUser(user);
  },
});
