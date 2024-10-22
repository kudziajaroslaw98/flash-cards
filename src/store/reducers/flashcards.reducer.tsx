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
    addNewFlashCard: (
      state,
      action: PayloadAction<
        Pick<FlashCard, 'question' | 'questionAddition' | 'answer'>
      >,
    ) => {
      const newUuid = uuid() as UUID;
      const newFlashCards = typedInstanceFactory(state, {
        [newUuid]: {
          frontUuid: newUuid,
          question: action.payload.question,
          questionAddition: action.payload.questionAddition,
          answer: action.payload.answer,
          order: Object.values(state).length,
          weight: 0.5,
        },
      });

      localStorage.setItem('flashcards', JSON.stringify(newFlashCards));
      state = newFlashCards;
      return state;
    },
    removeFlashCards: (state, action: PayloadAction<UUID[]>) => {
      action.payload.forEach((flashCardUuid) => {
        delete state?.[flashCardUuid];
      });

      Object.values(state).forEach((flashCard, index) => {
        flashCard.order = index;
      });

      localStorage.setItem('flashcards', JSON.stringify(state));
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
