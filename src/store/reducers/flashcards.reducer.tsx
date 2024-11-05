import { FlashCard } from '#/shared/models/flash-card.model';
import type { FlashCards } from '#/shared/types/local-storage-flash-card.type';
import type { UUID } from '#/shared/types/uuid.type';
import typedInstanceFactory from '#/shared/utils/typed-instance-factory.util';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

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
    addNewFlashCards: (state, action: PayloadAction<Partial<FlashCard>[]>) => {
      const mappedFlashCards = action.payload.map((flashCard, index) => ({
        ...flashCard,
        order: Object.values(state).length + (index + 1),
        weight: 1.0,
      }));

      mappedFlashCards.forEach((flashCard) => {
        if (flashCard?.frontUuid) {
          typedInstanceFactory(state, {
            [flashCard.frontUuid as UUID]: {
              frontUuid: flashCard.frontUuid,
              question: flashCard.question ?? '',
              questionAddition: flashCard.questionAddition ?? '',
              answer: flashCard.answer ?? '',
              order: flashCard.order,
              weight: flashCard.weight,
            },
          });
        }
      });

      localStorage.setItem('flashcards', JSON.stringify(state));
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
    updateFlashCards: (state, action: PayloadAction<Partial<FlashCard>[]>) => {
      action.payload.forEach((flashCard) => {
        if (flashCard?.frontUuid) {
          typedInstanceFactory(state, {
            [flashCard.frontUuid as UUID]: {
              frontUuid: flashCard.frontUuid,
              question: flashCard.question ?? '',
              questionAddition: flashCard.questionAddition ?? '',
              answer: flashCard.answer ?? '',
              order: flashCard.order ?? 0,
              weight: flashCard.weight ?? 1.0,
            },
          });
        }
      });

      localStorage.setItem('flashcards', JSON.stringify(state));
      return state;
    },
  },
});

export const {
  setFlashCards,
  setFlashCardsAfterSync,
  addNewFlashCards,
  removeFlashCards,
  updateFlashCard,
  updateFlashCards,
} = flashCardsSlice.actions;

export const flashCardsReducer = flashCardsSlice.reducer;
