import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import { Stats } from '#/shared/types/local-storage-stats.type';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: Stats = DEFAULT_STATS;

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<Stats>) => {
      state = action.payload;
      return state;
    },
    setStatsAfterSync: (state, action: PayloadAction<Stats>) => {
      state = action.payload;
      localStorage.setItem('stats', JSON.stringify(action.payload));
      return state;
    },
    updateStatistics: (
      state,
      action: PayloadAction<{
        updatedValue: unknown;
        property?: keyof Stats;
      }>,
    ) => {
      const { updatedValue, property } = action.payload;

      let StatsClone = {};

      if (property) {
        StatsClone = {
          ...state,
          [property]: updatedValue,
        };
      } else {
        StatsClone = updatedValue as Stats;
      }

      state = StatsClone as Stats;
      localStorage.setItem('stats', JSON.stringify(StatsClone));
      return state;
    },
  },
});

export const { setStats, setStatsAfterSync, updateStatistics } =
  statsSlice.actions;

export const statsReducer = statsSlice.reducer;
