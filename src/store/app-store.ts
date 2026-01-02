import { create } from 'zustand';
import type { AppState } from './app-state';
import { createAIStreamingSlice } from './slices/ai-streaming-slice';
import { createFlashcardsSlice } from './slices/flashcards-slice';
import { createMetadataSlice } from './slices/metadata-slice';
import { createRemindersSlice } from './slices/reminders-slice';
import { createRevisePlanSlice } from './slices/revise-plan-slice';
import { createSessionSlice } from './slices/session-slice';
import { createSetsSlice } from './slices/sets-slice';
import { createStreamingToastSlice } from './slices/streaming-toast-slice';
import { createStudyPlansSlice } from './slices/study-plans-slice';
import { createSyncSlice } from './slices/sync-slice';

const sliceCreators = [
  createSessionSlice,
  createFlashcardsSlice,
  createSetsSlice,
  createMetadataSlice,
  createRemindersSlice,
  createStudyPlansSlice,
  createRevisePlanSlice,
  createSyncSlice,
  createStreamingToastSlice,
  createAIStreamingSlice,
];

const useAppStore = create<AppState>((set, get, api) => {
  // Helper to create state from all slices
  const createState = () => {
    return sliceCreators.reduce((state, creator) => {
      return { ...state, ...creator(set, get, api) };
    }, {} as AppState);
  };

  return createState();
});

export default useAppStore;
