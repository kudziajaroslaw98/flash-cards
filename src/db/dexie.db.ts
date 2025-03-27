import type { DailyStat } from '#/types/daily-stat.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { FocusSession } from '#/types/focus-session.type';
import type { Metadata } from '#/types/metadata.type';
import type { Reminder } from '#/types/reminder.type';
import type { ReviewLog } from '#/types/review-log.type';
import type { StudyDay } from '#/types/study-day.type';
import type { StudyPlan } from '#/types/study-plan.type';
import type { StudySession } from '#/types/study-session.type';
import Dexie from 'dexie';

export class AppDB extends Dexie {
  flashcards!: Dexie.Table<Flashcard, string>;
  sets!: Dexie.Table<FlashcardSet, string>;
  metadata!: Dexie.Table<Metadata, string>;
  focusSessions!: Dexie.Table<FocusSession, string>;
  dailyStats!: Dexie.Table<DailyStat, string>;
  reviewLogs!: Dexie.Table<ReviewLog, string>;
  reminders!: Dexie.Table<Reminder, string>;
  studyPlans!: Dexie.Table<StudyPlan, string>;
  studyDays!: Dexie.Table<StudyDay, string>;
  studySessions!: Dexie.Table<StudySession, string>;

  constructor() {
    super('FlashcardDB');

    this.version(9).stores({
      flashcards:
        'frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
      sets: 'frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
      metadata: 'key, synced',
      dailyStats: 'frontUuid, updatedAt, date, synced',
      focusSessions: 'frontUuid, timestamp, start, end, synced',
      reviewLogs:
        'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
      reminders:
        'frontUuid, start, repeat, enabled, synced, createdAt, updatedAt',
      studyPlans: 'frontUuid, synced, *focusTags, *days',
      studySessions:
        'frontUuid, synced, *completedCards, currentDay, startDate, planId',
      studyDays:
        'frontUuid, synced, *objectives, dayNumber, planId, *cardsToReview, *newCards',
    });

    // Setup hooks
    this.setupHooks();
  }

  private setupHooks() {
    this.flashcards.hook('updating', (modifications: Partial<Flashcard>) => {
      modifications.updatedAt = new Date().toUTCString();
      modifications.synced = false;
    });

    this.flashcards.hook('creating', (primKey, card) => {
      card.synced = card.synced === true;
    });

    this.dailyStats.hook('updating', (modifications: Partial<DailyStat>) => {
      modifications.synced = false;
    });

    this.metadata.hook('updating', (modifications: Partial<Metadata>) => {
      modifications.synced = false;
    });

    this.sets.hook('updating', (modifications: Partial<FlashcardSet>) => {
      modifications.updatedAt = new Date().toUTCString();
      modifications.synced = false;
    });

    this.sets.hook('creating', (primKey, set) => {
      set.synced = set.synced === true;
    });

    this.reminders.hook('updating', (modifications: Partial<Reminder>) => {
      modifications.updatedAt = new Date().toUTCString();
      modifications.synced = false;
    });

    this.reminders.hook('creating', (primKey, reminder) => {
      reminder.synced = reminder.synced === true;
    });

    this.studyPlans.hook('updating', (modifications: Partial<StudyPlan>) => {
      modifications.updatedAt = new Date().toUTCString();
      modifications.synced = false;
    });

    this.studyDays.hook('updating', (modifications: Partial<StudyDay>) => {
      modifications.updatedAt = new Date().toUTCString();
      modifications.synced = false;
    });

    this.studySessions.hook(
      'updating',
      (modifications: Partial<StudySession>) => {
        modifications.updatedAt = new Date().toUTCString();
        modifications.synced = false;
      },
    );

    this.studyPlans.hook('creating', (primKey, plan) => {
      plan.synced = plan.synced === true;
    });

    this.studyDays.hook('creating', (primKey, day) => {
      day.synced = day.synced === true;
    });

    this.studySessions.hook('creating', (primKey, session) => {
      session.synced = session.synced === true;
    });
  }
}

export const db = new AppDB();
