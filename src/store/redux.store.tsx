import { statsReducer } from './reducers/stats.reducer';
import { setsReducer } from './reducers/sets.reducer';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    sets: setsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
