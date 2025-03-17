'use client';
import { db } from '#/db/dexie.db';
import type { Flashcard } from '#/types/flash-card.type';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { endOfToday } from 'date-fns/endOfToday';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

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
  setPickedPlan: Dispatch<SetStateAction<StudyPlan | null>>;
  setReviseStage: Dispatch<SetStateAction<number>>;
  setCurrentDay: Dispatch<SetStateAction<StudyDay | null>>;
  setCurrentSession: Dispatch<SetStateAction<StudySession | null>>;
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
  setReviseStage: () => {},
  setPickedPlan: () => {},
  setCurrentDay: () => {},
  setCurrentSession: () => {},
});

export default function RevisePlanProvider(props: Readonly<PropsWithChildren>) {
  const [reviseStage, setReviseStage] = useState<number>(0);
  const [pickedPlan, setPickedPlan] = useState<StudyPlan | null>(null);
  const [currentDay, setCurrentDay] = useState<StudyDay | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null,
  );

  const studySession = useLiveQuery(
    () =>
      db.studySessions
        .where('planId')
        .equals(pickedPlan?.id ?? '')
        .first(),
    [pickedPlan],
  );
  const studyDays =
    useLiveQuery(
      () =>
        db.studyDays
          .where('planId')
          .equals(pickedPlan?.id ?? '')
          .toArray(),
      [pickedPlan],
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
      console.log('🚀 ~ :84 ~ useLiveQuery ~ currentSession:', currentSession);
      return db.flashcards
        .where('frontUuid')
        .anyOf([...currentSession.completedCards])
        .toArray();
    }, [currentSession]) ?? [];

  useEffect(() => {
    if (studySession) {
      const currentDayNumber =
        studySession.currentDay === 0 ? 1 : studySession.currentDay;
      const currentDay = studyDays?.find(
        (day) => day.dayNumber === currentDayNumber,
      );
      if (currentDayNumber === 1 && studySession.stage === 0) {
        setReviseStage(3);
      } else {
        setReviseStage(studySession.stage);
      }
      setCurrentSession(studySession);
      setCurrentDay(currentDay ?? null);
    }
  }, [studySession, studyDays]);

  useEffect(() => {
    if (reviseStage === 6 && currentSession && currentDay) {
      db.studySessions.update(currentSession.id, {
        currentDay: currentDay.dayNumber + 1,
        nextRevisionDate: endOfToday().toUTCString(),
        stage: 1,
      });
    }

    if (reviseStage !== 0 && currentSession) {
      db.studySessions.update(currentSession?.id, { stage: reviseStage });
    }
  }, [reviseStage]);

  return (
    <RevisePlanContext.Provider
      value={{
        reviseStage,
        pickedPlan,
        currentDay,
        currentSession,
        studySession,
        studyDays,
        studyPlans,
        reviewFlashcards,
        newFlashcards,
        completedFlashcards,
        setPickedPlan,
        setCurrentDay,
        setReviseStage,
        setCurrentSession,
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
      'useRevisePlanContext must be used within RevisePlanProvider',
    );
  }

  return context;
};
