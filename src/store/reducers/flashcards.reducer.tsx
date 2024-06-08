import { FlashCard } from '#/shared/models/flash-card.model';
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
      state = action.payload;
      return state;
    },
    setFlashCardsAfterSync: (state, action: PayloadAction<FlashCards>) => {
      state = action.payload;
      localStorage.setItem('flashcards', JSON.stringify(action.payload));
      return state;
    },
    addNewFlashCard: (state) => {
      const flashCardsClone = { ...state };
      const newUuid = uuid() as UUID;
      const newFlashCards = typedInstanceFactory(flashCardsClone, {
        [newUuid]: {
          frontUuid: newUuid,
          word: 'new-word',
          definition: 'new-definition',
          order: Object.values(state).length,
          weight: 0.5,
        },
      });

      localStorage.setItem('flashcards', JSON.stringify(newFlashCards));
      state = newFlashCards;
      return state;
    },
    removeFlashCards: (state, action: PayloadAction<UUID[]>) => {
      const flashCardsClone = { ...state };

      action.payload.forEach((flashCardUuid) => {
        delete flashCardsClone?.[flashCardUuid];
      });

      Object.values(flashCardsClone).forEach((flashCard, index) => {
        flashCard.order = index;
      });

      localStorage.setItem('flashcards', JSON.stringify(flashCardsClone));
      state = flashCardsClone;
      return state;
    },
    updateFlashCard: (
      state,
      action: PayloadAction<{
        flashCard: FlashCard;
        updatedValue: unknown;
        property?: keyof FlashCard;
      }>,
    ) => {
      const flashCardsClone = { ...state };
      const { flashCard, updatedValue, property } = action.payload;

      if (property) {
        flashCardsClone[flashCard.frontUuid] = {
          ...flashCard,
          [property]: updatedValue,
        };
      } else {
        flashCardsClone[flashCard.frontUuid] = updatedValue as FlashCard;
      }

      state = flashCardsClone;
      localStorage.setItem('flashcards', JSON.stringify(flashCardsClone));
      return state;
    },
  },
});

export const {
  setFlashCards,
  setFlashCardsAfterSync,
  addNewFlashCard,
  removeFlashCards,
  updateFlashCard,
} = flashCardsSlice.actions;

export const flashCardsReducer = flashCardsSlice.reducer;
