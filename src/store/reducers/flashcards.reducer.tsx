import { FlashCardModel } from '#/shared/models/flash-card.model';
import type { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import type { UUID } from '#/shared/types/uuid.type';
import typedInstanceFactory from '#/shared/utils/typed-instance-factory.util';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

const initialState: FlashCards = {};

export const flashCardsSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    setFlashCards: (state, action: PayloadAction<FlashCards>) => {
      console.log('🚀 ~ action.payload:', action.payload);

      state = { ...action.payload };
      console.log('🚀 ~ action.payload:', action.payload);
      return state;
    },
    add: (state) => {
      const flashCardsClone = { ...state };
      const newUuid = uuid() as UUID;
      const newFlashCards = typedInstanceFactory(flashCardsClone, {
        [newUuid]: {
          uuid: newUuid,
          word: 'new-word',
          definition: 'new-definition',
          order: Object.values(state).length,
          weight: 0.5,
        },
      });

      state = newFlashCards;
      return state;
    },
    remove: (state, action: PayloadAction<UUID[]>) => {
      const flashCardsClone = { ...state };

      action.payload.forEach((flashCardUuid) => {
        delete flashCardsClone?.[flashCardUuid];
      });

      Object.values(flashCardsClone).forEach((flashCard, index) => {
        flashCard.order = index;
      });

      state = flashCardsClone;
      return state;
    },
    update: (
      state,
      action: PayloadAction<{
        flashCard: FlashCardModel;
        updatedValue: unknown;
        property?: keyof FlashCardModel;
      }>,
    ) => {
      const flashCardsClone = { ...state };
      const { flashCard, updatedValue, property } = action.payload;

      if (property) {
        flashCardsClone[flashCard.uuid] = {
          ...flashCard,
          [property]: updatedValue,
        };
      } else {
        flashCardsClone[flashCard.uuid] = updatedValue as FlashCardModel;
      }

      state = flashCardsClone;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFlashCards, add, remove, update } = flashCardsSlice.actions;

export const flashCardsReducer = flashCardsSlice.reducer;
