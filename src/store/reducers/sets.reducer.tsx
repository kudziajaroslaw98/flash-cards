import { FlashCardSet } from '#/shared/models/flash-card-set.model';
import typedObjectAssign from '#/shared/utils/typed-instance-factory.util';
import { Sets } from '#/types//local-storage-sets.type';
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
    addNewSets: (state, action: PayloadAction<Partial<FlashCardSet>[]>) => {
      action.payload.forEach((set) => {
        if (set?.frontUuid) {
          typedObjectAssign(state, {
            [set.frontUuid]: {
              frontUuid: set.frontUuid,
              name: set.name ?? '',
              description: set.description ?? '',
              category: set.category ?? '',
              isFavourite: set.isFavourite ?? false,
              flashCards: [],
              hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
            },
          });
        }
      });

      localStorage.setItem('sets', JSON.stringify(state));
      return state;
    },
    removeSets: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((setUuid) => {
        delete state?.[setUuid];
      });

      localStorage.setItem('sets', JSON.stringify(state));
      return state;
    },
    updateSet: (state, action: PayloadAction<Partial<FlashCardSet>>) => {
      const set = action.payload;

      if (set?.frontUuid) {
        typedObjectAssign(state, {
          [set.frontUuid]: {
            frontUuid: set.frontUuid,
            name: set.name ?? '',
            description: set.description ?? '',
            category: set.category ?? '',
            isFavourite: set.isFavourite ?? false,
            flashCards: set.flashCards ?? [],
            hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
          },
        });
      }

      localStorage.setItem('sets', JSON.stringify(state));
      return state;
    },
    updateSets: (state, action: PayloadAction<Partial<FlashCardSet>[]>) => {
      action.payload.forEach((set) => {
        if (set?.frontUuid) {
          typedObjectAssign(state, {
            [set.frontUuid]: {
              frontUuid: set.frontUuid,
              name: set.name ?? '',
              description: set.description ?? '',
              category: set.category ?? '',
              isFavourite: set.isFavourite ?? false,
              flashCards: set.flashCards ?? [],
              hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
            },
          });
        }
      });

      localStorage.setItem('sets', JSON.stringify(state));
      return state;
    },
  },
});

export const {
  setSets,
  setSetsAfterSync,
  addNewSets,
  removeSets,
  updateSet,
  updateSets,
} = setsSlice.actions;

export const setsReducer = setsSlice.reducer;
