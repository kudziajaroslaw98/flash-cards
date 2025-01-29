import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { defaultMetadata } from '#/shared/defaults/default-metadata';
import { defaultSet } from '#/shared/defaults/default-set';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import { metadataMerge } from '#/shared/helpers/metadata-merge';
import { setsMerge } from '#/shared/helpers/sets-merge';
import { calculateWeight } from '#/shared/utils/calculate-weight';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import Dexie from 'dexie';

export class AppDB extends Dexie {
  flashcards!: Dexie.Table<Flashcard, string>;
  sets!: Dexie.Table<FlashcardSet, string>;
  metadata!: Dexie.Table<Metadata, string>;

  constructor() {
    super('FlashcardDB');

    this.version(1)
      .stores({
        flashcards:
          '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, [setUuids+spacedRepetition.dueDate]',
        sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards',
        metadata: 'key',
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
          '&frontUuid, tags, createdAt, updatedAt, *sets, spacedRepetition.dueDate, spacedRepetition.easeFactor, spacedRepetition.weight, [setUuids+spacedRepetition.dueDate], [setUuids+spacedRepetition.weight], spacedRepetition.reversedWeight, spacedRepetition.culmulativeWeight',
        sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards',
        metadata: 'key',
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
            console.log(x);
            return x;
          });

        transaction
          .table('metadata')
          .toCollection()
          .modify((meta) => {
            metadataMerge(defaultMetadata, meta);
          });
      });

    // Setup hooks
    this.setupFlashcardHooks();
    this.setupSetHooks();
  }

  private setupFlashcardHooks() {
    this.flashcards.hook('updating', (modifications: Partial<Flashcard>) => {
      modifications.updatedAt = new Date().toISOString();
      modifications.synced = false;
    });

    this.flashcards.hook('creating', (primKey, card) => {
      card.synced = card.synced === true;
    });
  }

  private setupSetHooks() {
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
