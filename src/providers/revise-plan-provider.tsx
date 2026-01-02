'use client';

import { db } from '#/db/dexie.db';
import useAppStore from '#/store/app-store';
import type { Flashcard } from '#/types/flash-card.type';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  useContext,
  useEffect,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { useShallow } from 'zustand/shallow';

export type RevisePlanContextType = {
  reviseStage: number;
  pickedPlan: StudyPlan | null;
  currentDay: StudyDay | null;
  currentSession: StudySession | null;
  studyPlans: StudyPlan[];
  studyDays: StudyDay[];
  studySession: StudySession | undefined;
  reviewFlashcards: Flashcard[];
  newFlashcards: Flashcard[];
  completedFlashcards: Flashcard[];
  clicked: boolean;
  setPickedPlan: Dispatch<SetStateAction<StudyPlan | null>>;
  setReviseStage: Dispatch<SetStateAction<number>>;
  setCurrentDay: Dispatch<SetStateAction<StudyDay | null>>;
  setCurrentSession: Dispatch<SetStateAction<StudySession | null>>;
  setClicked: Dispatch<SetStateAction<boolean>>;
};

export const RevisePlanContext = createContext<RevisePlanContextType>({
  reviseStage: 0,
  pickedPlan: null,
  currentDay: null,
  currentSession: null,
  studyPlans: [],
  studyDays: [],
  studySession: undefined,
  reviewFlashcards: [],
  newFlashcards: [],
  completedFlashcards: [],
  clicked: false,
  setReviseStage: () => {},
  setPickedPlan: () => {},
  setCurrentDay: () => {},
  setCurrentSession: () => {},
  setClicked: () => {},
});

export default function RevisePlanProvider(props: Readonly<PropsWithChildren>) {
  // Get state and actions from Zustand store
  const {
    reviseStage,
    pickedStudyPlan,
    currentDay,
    currentSession,
    clicked,
    setReviseStage,
    setPickedStudyPlan,
    setCurrentDay,
    setCurrentSession,
    setClicked,
    updateReviseStage,
  } = useAppStore(
    useShallow((state) => ({
      reviseStage: state.reviseStage,
      pickedStudyPlan: state.pickedStudyPlan,
      currentDay: state.currentDay,
      currentSession: state.currentSession,
      clicked: state.clicked,
      setReviseStage: state.setReviseStage,
      setPickedStudyPlan: state.setPickedStudyPlan,
      setCurrentDay: state.setCurrentDay,
      setCurrentSession: state.setCurrentSession,
      setClicked: state.setClicked,
      updateReviseStage: state.updateReviseStage,
    }))
  );

  // Keep Dexie live queries for reactive data
  const studySession = useLiveQuery(
    () =>
      db.studySessions
        .where('planId')
        .equals(pickedStudyPlan?.frontUuid ?? '')
        .first(),
    [pickedStudyPlan]
  );

  const studyDays =
    useLiveQuery(
      () =>
        db.studyDays
          .where('planId')
          .equals(pickedStudyPlan?.frontUuid ?? '')
          .toArray(),
      [pickedStudyPlan]
    ) ?? [];

  const studyPlans = useLiveQuery(() => db.studyPlans.toArray()) ?? [];

  const reviewFlashcards =
    useLiveQuery(() => {
      if (!currentDay) {
        return [];
      }
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentDay.cardsToReview])
        .toArray();
    }, [currentDay]) ?? [];

  const newFlashcards =
    useLiveQuery(() => {
      if (!currentDay) {
        return [];
      }
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentDay.newCards])
        .toArray();
    }, [currentDay]) ?? [];

  const completedFlashcards =
    useLiveQuery(() => {
      if (!currentSession) {
        return [];
      }
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentSession.completedCards])
        .toArray();
    }, [currentSession]) ?? [];

  // Sync study session with Zustand state
  useEffect(() => {
    if (studySession) {
      const currentDayNumber =
        studySession.currentDay === 0 ? 1 : studySession.currentDay;
      const day = studyDays?.find((d) => d.dayNumber === currentDayNumber);

      if (currentDayNumber === 1 && studySession.stage === 0) {
        setReviseStage(3);
      } else {
        setReviseStage(studySession.stage);
      }

      setCurrentSession(studySession);
      setCurrentDay(day ?? null);
    }
  }, [studySession, studyDays, setReviseStage, setCurrentSession, setCurrentDay]);

  // Handle revise stage changes
  useEffect(() => {
    if (reviseStage !== 0) {
      updateReviseStage(reviseStage);
    }
  }, [reviseStage, updateReviseStage]);

  // Create wrapper functions that match the expected Dispatch<SetStateAction<T>> signature
  const handleSetPickedPlan: Dispatch<SetStateAction<StudyPlan | null>> = (
    value
  ) => {
    if (typeof value === 'function') {
      const newValue = value(pickedStudyPlan);
      setPickedStudyPlan(newValue);
    } else {
      setPickedStudyPlan(value);
    }
  };

  const handleSetReviseStage: Dispatch<SetStateAction<number>> = (value) => {
    if (typeof value === 'function') {
      const newValue = value(reviseStage);
      setReviseStage(newValue);
    } else {
      setReviseStage(value);
    }
  };

  const handleSetCurrentDay: Dispatch<SetStateAction<StudyDay | null>> = (
    value
  ) => {
    if (typeof value === 'function') {
      const newValue = value(currentDay);
      setCurrentDay(newValue);
    } else {
      setCurrentDay(value);
    }
  };

  const handleSetCurrentSession: Dispatch<
    SetStateAction<StudySession | null>
  > = (value) => {
    if (typeof value === 'function') {
      const newValue = value(currentSession);
      setCurrentSession(newValue);
    } else {
      setCurrentSession(value);
    }
  };

  const handleSetClicked: Dispatch<SetStateAction<boolean>> = (value) => {
    if (typeof value === 'function') {
      const newValue = value(clicked);
      setClicked(newValue);
    } else {
      setClicked(value);
    }
  };

  return (
    <RevisePlanContext.Provider
      value={{
        reviseStage,
        pickedPlan: pickedStudyPlan,
        currentDay,
        currentSession,
        studySession,
        studyDays,
        studyPlans,
        reviewFlashcards,
        newFlashcards,
        completedFlashcards,
        clicked,
        setPickedPlan: handleSetPickedPlan,
        setCurrentDay: handleSetCurrentDay,
        setReviseStage: handleSetReviseStage,
        setCurrentSession: handleSetCurrentSession,
        setClicked: handleSetClicked,
      }}
    >
      {props.children}
    </RevisePlanContext.Provider>
  );
}

export const useRevisePlanContext = () => {
  const context = useContext(RevisePlanContext);

  if (!context) {
    throw new Error(
      'useRevisePlanContext must be used within RevisePlanProvider'
    );
  }

  return context;
};
