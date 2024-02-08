import { RootState } from '../redux.store';

const selectStats = (state: RootState) => state.stats;

export const statsSelectors = {
  selectStats,
};
