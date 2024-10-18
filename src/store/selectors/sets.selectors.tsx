import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../redux.store';

const setsState = (state: RootState) => state.sets;

const selectSetsArray = createSelector([setsState], (flashCards) =>
  Object.values(flashCards),
);

export const setsSelectors = {
  selectSetsArray,
  selectSets: setsState,
};
