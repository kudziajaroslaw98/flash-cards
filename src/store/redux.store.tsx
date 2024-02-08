import { configureStore } from '@reduxjs/toolkit';
import { flashCardsReducer } from './reducers/flashcards.reducer';
import { statsReducer } from './reducers/stats.reducer';

export const store = configureStore({
  reducer: {
    flashCards: flashCardsReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
