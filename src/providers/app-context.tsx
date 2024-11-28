import { FLASHCARDS_LOCAL_STORAGE_INIT } from '#/shared/defaults/flashcards-local-storage-init';
import { SETS_LOCAL_STORAGE_INIT } from '#/shared/defaults/sets-local-storage-init';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { FlashCard } from '#/shared/models/flash-card.model';
import useLocalStorage from '#/hooks/use-local-storage.hook';

export type AppContextType = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  setFlashCards: (flashcards: FlashCard[]) => void;
  addFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  removeFlashCards: (flashcards: FlashCard[]) => void;
  updateFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  updateFlashCard: (flashcard: Partial<FlashCard>) => void;
};

export const AppContext = createContext<AppContextType>({
  flashcards: [],
  sets: [],
  setFlashCards: () => null,
  addFlashCards: () => null,
  removeFlashCards: () => null,
  updateFlashCards: () => null,
  updateFlashCard: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
  /////////////////
  // STATE
  /////////////////

  const [flashCardsArray, setFlashCardsArray] = useState<FlashCard[]>([]);
  const [setsArray, setSetsArray] = useState<FlashCardSet[]>([]);

  /////////////////
  // LOCAL STORAGE
  /////////////////

  useLocalStorage({
    key: 'flashcards',
    defaultValue: FLASHCARDS_LOCAL_STORAGE_INIT,
    setArrayValue: setFlashCardsArray,
  });
  useLocalStorage({ key: 'sets', defaultValue: SETS_LOCAL_STORAGE_INIT, setArrayValue: setSetsArray });

  /////////////////
  // FLASHCARDS MANAGEMENT
  /////////////////

  const setFlashCards = (flashcards: FlashCard[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};

    flashcards.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });
    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(flashcards);
  };

  const addFlashCards = (flashcards: Partial<FlashCard>[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const flashcardSize = flashCardsArray.length;

    const mappedFlashCards: FlashCard[] = flashcards.map((flashCard, index) => {
      const flashCardUuid = flashCard.frontUuid ?? crypto.randomUUID();
      return {
        frontUuid: flashCardUuid,
        question: flashCard.question ?? '',
        questionAddition: flashCard.questionAddition ?? '',
        answer: flashCard.answer ?? '',
        order: flashcardSize + (index + 1),
        weight: 1.0,
      };
    });

    const flashcardsOutput = [...flashCardsArray, ...mappedFlashCards];
    flashcardsOutput.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(flashcardsOutput);
  };

  const removeFlashCards = (flashcards: FlashCard[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const filteredFlashcards = flashCardsArray.filter((item: FlashCard) => !flashcards.includes(item));

    filteredFlashcards.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(filteredFlashcards);
  };

  const updateFlashCards = (flashcards: Partial<FlashCard>[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const mappedFlashCards: FlashCard[] = flashcards.map((flashCard, index) => ({
      frontUuid: flashCard.frontUuid ?? crypto.randomUUID(),
      order: flashCard.order ?? index + 1,
      weight: flashCard.weight ?? 1.0,
      questionAddition: flashCard.questionAddition ?? '',
      question: flashCard.question ?? '',
      answer: flashCard.answer ?? '',
    }));

    const updatedFlashcards = flashCardsArray.map((flashCard) => {
      const updatedFlashcard = mappedFlashCards.find((item) => item.frontUuid === flashCard.frontUuid) ?? flashCard;

      flashcardsObject[flashCard.frontUuid] = updatedFlashcard;
      return updatedFlashcard;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashcards);
  };

  const updateFlashCard = (flashcard: Partial<FlashCard>) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const updatedFlashcard = {
      frontUuid: flashcard.frontUuid ?? crypto.randomUUID(),
      order: flashcard.order ?? flashCardsArray.length + 1,
      weight: flashcard.weight ?? 1.0,
      questionAddition: flashcard.questionAddition ?? '',
      question: flashcard.question ?? '',
      answer: flashcard.answer ?? '',
    };

    const updatedFlashcards = flashCardsArray.map((item) => {
      if (item.frontUuid === flashcard.frontUuid) {
        flashcardsObject[item.frontUuid] = updatedFlashcard;
        return updatedFlashcard;
      }

      flashcardsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashcards);
  };

  return (
    <AppContext.Provider
      value={{
        flashcards: flashCardsArray,
        sets: setsArray,
        setFlashCards,
        addFlashCards,
        removeFlashCards,
        updateFlashCards,
        updateFlashCard,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};
