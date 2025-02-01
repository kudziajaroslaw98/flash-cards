import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { defaultSet } from '#/shared/defaults/default-set';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { metadataMerge } from '#/shared/helpers/metadata-merge';
import { setsMerge } from '#/shared/helpers/sets-merge';
import { calculateWeight } from '#/shared/utils/calculate-weight';
import uuid from '#/shared/utils/uuid.util';
import type { DailyStat } from '#/types/daily-stat.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { FocusSession } from '#/types/focus-session.type';
import type { Metadata } from '#/types/metadata.type';
import type { ReviewLog } from '#/types/review-log.type';
import Dexie from 'dexie';

export class AppDB extends Dexie {
  flashcards!: Dexie.Table<Flashcard, string>;
  sets!: Dexie.Table<FlashcardSet, string>;
  metadata!: Dexie.Table<Metadata, string>;
  focusSessions!: Dexie.Table<FocusSession, string>;
  dailyStats!: Dexie.Table<DailyStat, string>;
  reviewLogs!: Dexie.Table<ReviewLog, string>;

  constructor() {
    super('FlashcardDB');

    this.version(1)
      .stores({
        flashcards:
          '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
        sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
        metadata: 'key, synced',
        dailyStats: 'frontUuid, updatedAt, date, synced',
        focusSessions: 'frontUuid, timestamp, start, end, synced',
        reviewLogs:
          'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
      })
      .upgrade((transaction) => {
        transaction
          .table('flashcards')
          .toCollection()
          .modify((card) => {
            flashcardsMerge(defaultFlashcard, card);
          });

        transaction
          .table('sets')
          .toCollection()
          .modify((set) => {
            setsMerge(defaultSet, set);
          });

        transaction
          .table('metadata')
          .toCollection()
          .modify((meta) => {
            metadataMerge(defaultMetadata, meta);
          });
      });
    this.version(2)
      .stores({
        flashcards:
          '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
        sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
        metadata: 'key, synced',
        dailyStats: 'frontUuid, updatedAt, date, synced',
        focusSessions: 'frontUuid, timestamp, start, end, synced',
        reviewLogs:
          'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
      })
      .upgrade((transaction) => {
        transaction
          .table('flashcards')
          .toCollection()
          .modify((card: Flashcard) => {
            const x = flashcardsMerge(defaultFlashcard, {
              ...card,
              spacedRepetition: {
                ...card.spacedRepetition,
                weight: calculateWeight(card.spacedRepetition.dueDate),
              },
            });
            return x;
          });

        transaction
          .table('metadata')
          .toCollection()
          .modify((meta) => {
            metadataMerge(defaultMetadata, meta);
          });
      });

    this.version(3).stores({
      flashcards:
        '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
      sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
      metadata: 'key, synced',
      dailyStats: 'frontUuid, updatedAt, date, synced',
      focusSessions: 'frontUuid, timestamp, start, end, synced',
      reviewLogs:
        'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
    });

    this.version(4).stores({
      flashcards:
        '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
      sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
      metadata: 'key, synced',
      dailyStats: 'frontUuid, updatedAt, date, synced',
      focusSessions: 'frontUuid, timestamp, start, end, synced',
      reviewLogs:
        'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
    });

    this.version(5)
      .stores({
        flashcards:
          '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate], synced',
        sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards, synced',
        metadata: 'key, synced',
        dailyStats: 'frontUuid, updatedAt, date, synced',
        focusSessions: 'frontUuid, timestamp, start, end, synced',
        reviewLogs:
          'frontUuid, timestamp, sessionUuid, cardFrontUuid, *tags, synced',
      })
      .upgrade((transaction) => {
        transaction
          .table('dailyStats')
          .toCollection()
          .modify((stat: DailyStat) => {
            return {
              ...stat,
              updatedAt: stat.updatedAt ? stat.updatedAt : new Date(),
              frontUuid: stat.frontUuid ? stat.frontUuid : uuid(),
            };
          });
        transaction
          .table('metadata')
          .toCollection()
          .modify((metadata: Metadata) => {
            return {
              ...metadata,
              updatedAt: metadata.updatedAt ? metadata.updatedAt : new Date(),
            };
          });
        transaction
          .table('focusSessions')
          .toCollection()
          .modify((session: FocusSession) => {
            return {
              ...session,
              timestamp: session.timestamp ? session.timestamp : new Date(),
              frontUuid: session.frontUuid ? session.frontUuid : uuid(),
            };
          });
        transaction
          .table('reviewLogs')
          .toCollection()
          .modify((log: ReviewLog) => {
            return {
              ...log,
              frontUuid: log.frontUuid ? log.frontUuid : uuid(),
            };
          });
      });

    // Setup hooks
    this.setupHooks();
  }

  private setupHooks() {
    this.flashcards.hook('updating', (modifications: Partial<Flashcard>) => {
      modifications.updatedAt = new Date().toISOString();
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
      modifications.updatedAt = new Date().toISOString();
      modifications.synced = false;
    });

    this.sets.hook('creating', (primKey, set) => {
      set.synced = set.synced === true;
    });
  }
}

export const db = new AppDB();
