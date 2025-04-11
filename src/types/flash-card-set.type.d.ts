import type { FlashcardGenerationOptions } from './flashcard-generation-options.type';
export type FlashcardSet = {
  frontUuid: string;
  name: string;
  description: string;
  flashcards: string[];
  isFavourite: boolean;
  category?: string;
  hardlink: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  reminders: string[];
  generationOptions?: FlashcardGenerationOptions;
};
