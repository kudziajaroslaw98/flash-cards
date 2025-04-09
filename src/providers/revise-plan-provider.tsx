'use client';
import { db } from '#/db/dexie.db';
import type { Flashcard } from '#/types/flash-card.type';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import { isAfter } from 'date-fns';
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
  const [reviseStage, setReviseStage] = useState<number>(0);
  const [pickedPlan, setPickedPlan] = useState<StudyPlan | null>(null);
  const [currentDay, setCurrentDay] = useState<StudyDay | null>(null);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null,
  );
  const [clicked, setClicked] = useState(false);

  const studySession = useLiveQuery(
    () =>
      db.studySessions
        .where('planId')
        .equals(pickedPlan?.frontUuid ?? '')
        .first(),
    [pickedPlan],
  );
  const studyDays =
    useLiveQuery(
      () =>
        db.studyDays
          .where('planId')
          .equals(pickedPlan?.frontUuid ?? '')
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
      db.studySessions.update(currentSession.frontUuid, {
        currentDay: currentSession.currentDay + 1,
        nextRevisionDate: endOfToday().toUTCString(),
        stage: 1,
      });
      setReviseStage(1);
      return;
    }

    if (
      reviseStage !== 0 &&
      currentSession &&
      isAfter(new Date(), new Date(currentSession.nextRevisionDate))
    ) {
      db.studySessions.update(currentSession?.frontUuid, {
        stage: reviseStage,
      });
      return;
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
        clicked,
        setPickedPlan,
        setCurrentDay,
        setReviseStage,
        setCurrentSession,
        setClicked,
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
