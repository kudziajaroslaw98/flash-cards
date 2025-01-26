import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import type { Metadata } from '#/types/metadata.type';
import Dexie from 'dexie';

class AppDB extends Dexie {
  flashcards!: Dexie.Table<Flashcard, string>;
  sets!: Dexie.Table<FlashcardSet, string>;
  metadata!: Dexie.Table<Metadata, string>;

  constructor() {
    super('FlashcardDB');

    this.version(1).stores({
      flashcards: '&frontUuid, tags, createdAt, updatedAt, *sets',
      sets: '&frontUuid, createdAt, isFavourite, updatedAt, *flashcards',
      metadata: 'key',
    });
    // Setup hooks
    this.setupFlashcardHooks();
    this.setupSetHooks();
  }

  private setupFlashcardHooks() {
    this.flashcards.hook('updating', (modifications: Partial<Flashcard>) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }

  private setupSetHooks() {
    this.sets.hook('updating', (modifications: Partial<FlashcardSet>) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }
}

export const db = new AppDB();
