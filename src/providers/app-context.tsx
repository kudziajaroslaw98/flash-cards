import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { FLASHCARDS_LOCAL_STORAGE_INIT } from '#/shared/defaults/flashcards-local-storage-init';
import { SETS_LOCAL_STORAGE_INIT } from '#/shared/defaults/sets-local-storage-init';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashCard } from '#/shared/models/flash-card.model';
import { DEFAULT_STATS } from '#/shared/defaults/stats.default';
import type { Stats } from '#/types/local-storage-stats.type';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import uuid from '#/shared/utils/uuid.util';

export type AppContextType = {
  flashcards: FlashCard[];
  sets: FlashCardSet[];
  setsDictionary: DictionaryValue<string>[];
  categories: DictionaryValue<string>[];
  stats: Stats;
  setFlashCards: (flashcards: FlashCard[]) => void;
  addFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  removeFlashCards: (flashcards: FlashCard[]) => void;
  updateFlashCards: (flashcards: Partial<FlashCard>[]) => void;
  updateFlashCard: (flashcard: Partial<FlashCard>) => void;
  addSets: (set: Partial<FlashCardSet>[]) => void;
  removeSets: (set: FlashCardSet[]) => void;
  updateSet: (set: Partial<FlashCardSet>) => void;
  updateSets: (sets: Partial<FlashCardSet>[]) => void;
  updateStats: (stats: Partial<Stats>) => void;
};

export const AppContext = createContext<AppContextType>({
  flashcards: [],
  sets: [],
  setsDictionary: [],
  categories: [],
  stats: DEFAULT_STATS,
  setFlashCards: () => null,
  addFlashCards: () => null,
  removeFlashCards: () => null,
  updateFlashCards: () => null,
  updateFlashCard: () => null,
  addSets: () => null,
  removeSets: () => null,
  updateSet: () => null,
  updateSets: () => null,
  updateStats: () => null,
});

export default function AppProvider(props: PropsWithChildren) {
  /////////////////
  // STATE
  /////////////////

  const [flashCardsArray, setFlashCardsArray] = useState<FlashCard[]>([]);
  const [setsArray, setSetsArray] = useState<FlashCardSet[]>([]);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const [setsDictionary, setSetsDictionary] = useState<
    DictionaryValue<string>[]
  >([]);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  /////////////////
  // LOCAL STORAGE
  /////////////////

  useLocalStorage({
    key: 'flashcards',
    defaultValue: FLASHCARDS_LOCAL_STORAGE_INIT,
    setArrayValue: setFlashCardsArray,
  });
  useLocalStorage({
    key: 'sets',
    defaultValue: SETS_LOCAL_STORAGE_INIT,
    setArrayValue: setSetsArray,
  });

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
      const flashCardUuid = flashCard.frontUuid ?? uuid();
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
    const filteredFlashcards = flashCardsArray.filter(
      (item: FlashCard) => !flashcards.includes(item),
    );

    filteredFlashcards.forEach((item: FlashCard) => {
      flashcardsObject[item.frontUuid] = item;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(filteredFlashcards);
  };

  const updateFlashCards = (flashcards: Partial<FlashCard>[]) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const mappedFlashCards: FlashCard[] = flashcards.map(
      (flashCard, index) => ({
        frontUuid: flashCard.frontUuid ?? uuid(),
        order: flashCard.order ?? index + 1,
        weight: flashCard.weight ?? 1.0,
        questionAddition: flashCard.questionAddition ?? '',
        question: flashCard.question ?? '',
        answer: flashCard.answer ?? '',
      }),
    );

    const updatedFlashcards = flashCardsArray.map((flashCard) => {
      const updatedFlashcard =
        mappedFlashCards.find(
          (item) => item.frontUuid === flashCard.frontUuid,
        ) ?? flashCard;

      flashcardsObject[flashCard.frontUuid] = updatedFlashcard;
      return updatedFlashcard;
    });

    localStorage.setItem('flashcards', JSON.stringify(flashcardsObject));
    setFlashCardsArray(updatedFlashcards);
  };

  const updateFlashCard = (flashcard: Partial<FlashCard>) => {
    const flashcardsObject: Record<string, FlashCard> = {};
    const updatedFlashcard = {
      frontUuid: flashcard.frontUuid ?? uuid(),
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

  /////////////////
  // SETS MANAGEMENT
  /////////////////

  const addSets = (sets: Partial<FlashCardSet>[]) => {
    const setsObject: Record<string, FlashCardSet> = {};

    const mappedSets: FlashCardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
    }));

    const setsOutput = [...setsArray, ...mappedSets];
    setsOutput.forEach((item: FlashCardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(setsOutput);
  };

  const removeSets = (sets: FlashCardSet[]) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const filteredSets = setsArray.filter(
      (item: FlashCardSet) => !sets.includes(item),
    );

    filteredSets.forEach((item: FlashCardSet) => {
      setsObject[item.frontUuid] = item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(filteredSets);
  };

  const updateSets = (sets: Partial<FlashCardSet>[]) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const mappedSets: FlashCardSet[] = sets.map((set) => ({
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
    }));

    const updatedSets = setsArray.map((set) => {
      const updatedSet =
        mappedSets.find((item) => item.frontUuid === set.frontUuid) ?? set;

      setsObject[set.frontUuid] = updatedSet;
      return updatedSet;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(updatedSets);
  };

  const updateSet = (set: Partial<FlashCardSet>) => {
    const setsObject: Record<string, FlashCardSet> = {};
    const updatedSet = {
      frontUuid: set.frontUuid ?? uuid(),
      name: set.name ?? '',
      description: set.description ?? '',
      flashCards: set.flashCards ?? [],
      isFavourite: set.isFavourite ?? false,
      category: set.category ?? '',
      hardlink: set.name?.replace(/ /g, '-').toLowerCase() ?? '',
    };

    const updatedSets = setsArray.map((item) => {
      if (item.frontUuid === set.frontUuid) {
        setsObject[item.frontUuid] = updatedSet;
        return updatedSet;
      }

      setsObject[item.frontUuid] = item;
      return item;
    });

    localStorage.setItem('sets', JSON.stringify(setsObject));
    setSetsArray(updatedSets);
  };

  /////////////////
  // STATS MANAGEMENT
  /////////////////

  const updateStats = (update: Partial<Stats>) => {
    const updatedStats = { ...stats, ...update };

    localStorage.setItem('stats', JSON.stringify(updatedStats));
    setStats(updatedStats);
  };

  /////////////////
  // MIGRATION
  /////////////////

  const migrateSets = useCallback(() => {
    setSetsArray((prev) => {
      const updatedSets = prev.map((set) => ({
        ...set,
        flashCards: flashCardsArray.filter((flashCard) =>
          set.flashCards.includes(flashCard.frontUuid as unknown as FlashCard),
        ),
      }));
      const setsObject: Record<string, FlashCardSet> = {};
      updatedSets.forEach((item: FlashCardSet) => {
        setsObject[item.frontUuid] = item;
      });

      localStorage.setItem('sets', JSON.stringify(setsObject));
      return updatedSets;
    });
  }, [flashCardsArray]);

  /////////////////
  // MUTATIONS
  /////////////////

  useEffect(() => {
    if (
      setsArray.some(
        (set) =>
          set.flashCards.length > 0 &&
          set.flashCards.at(0)?.frontUuid === undefined,
      )
    ) {
      migrateSets();
    }

    const categoriesTmp = new Set<string>();
    const setsDictionary: DictionaryValue<string>[] = setsArray.map((item) => ({
      label: item.name,
      value: item.frontUuid,
    }));

    setsArray.forEach((set) => {
      if (set.category) {
        categoriesTmp.add(set.category);
      }
    });

    const selectCategoriesAsDictionary: DictionaryValue<string>[] = Array.from(
      categoriesTmp,
    ).map((item) => ({
      label: item,
      value: item,
    }));

    setCategories(selectCategoriesAsDictionary);
    setSetsDictionary(setsDictionary);
  }, [setsArray, migrateSets]);

  return (
    <AppContext.Provider
      value={{
        flashcards: flashCardsArray,
        sets: setsArray,
        setsDictionary,
        categories,
        stats,
        setFlashCards,
        addFlashCards,
        removeFlashCards,
        updateFlashCards,
        updateFlashCard,
        addSets,
        removeSets,
        updateSets,
        updateSet,
        updateStats,
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
