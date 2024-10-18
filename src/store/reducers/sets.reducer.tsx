import { FlashCardSet } from '#/shared/models/flashcard-set.model';
import { Sets } from '#/shared/types/local-storage-sets.type';
import { UUID } from '#/shared/types/uuid.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: Sets = {};

export const setsSlice = createSlice({
  name: 'sets',
  initialState,
  reducers: {
    setSets: (state, action: PayloadAction<Sets>) => {
      state = action.payload;
      return state;
    },
    setSetsAfterSync: (state, action: PayloadAction<Sets>) => {
      state = action.payload;
      localStorage.setItem('sets', JSON.stringify(action.payload));
      return state;
    },
    addNewSet: (state, action: PayloadAction<FlashCardSet>) => {
      const newSets = { ...state, [action.payload.frontUuid]: action.payload };

      localStorage.setItem('sets', JSON.stringify(newSets));
      state = newSets;
      return state;
    },
    removeSets: (state, action: PayloadAction<UUID[]>) => {
      action.payload.forEach((setUuid) => {
        delete state?.[setUuid];
      });

      localStorage.setItem('sets', JSON.stringify(state));
      return state;
    },
    updateSet: (state, action: PayloadAction<FlashCardSet>) => {
      const flashCardsClone = {
        ...state,
        [action.payload.frontUuid]: action.payload,
      };
      state = flashCardsClone;
      localStorage.setItem('sets', JSON.stringify(flashCardsClone));
      return state;
    },
  },
});

export const { setSets, setSetsAfterSync, addNewSet, removeSets, updateSet } =
  setsSlice.actions;

export const setsReducer = setsSlice.reducer;
