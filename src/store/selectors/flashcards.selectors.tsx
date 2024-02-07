import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../redux.store';

const flashCardsState = (state: RootState) => state.flashCards;

const selectFlashCardsArray = createSelector([flashCardsState], (flashCards) =>
  Object.values(flashCards),
);

export const flashCardSelectors = {
  selectFlashCardsArray,
  selectFlashCards: flashCardsState,
};
