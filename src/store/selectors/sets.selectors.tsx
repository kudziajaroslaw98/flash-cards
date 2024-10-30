import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../redux.store';

const setsState = (state: RootState) => state.sets;

const selectSetsArray = createSelector([setsState], (flashCards) =>
  Object.values(flashCards),
);

const selectCategoriesAsDictionary = createSelector([setsState], (setsLS) => {
  const sets = Object.values(setsLS);
  const categories: Set<string> = new Set();

  sets.forEach((set) => {
    if (set.category) {
      categories.add(set.category);
    }
  });

  const categoriesArray = Array.from(categories).map((category) => ({
    value: category,
    label: category,
  }));

  return categoriesArray;
});

export const setsSelectors = {
  selectSetsArray,
  selectSets: setsState,
  selectCategoriesAsDictionary,
};
