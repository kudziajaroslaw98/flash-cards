import type { Flashcard } from '#/types/flash-card.type';
import { flashcardsMerge } from '../helpers/flashcards-merge';
import uuid from '../utils/uuid.util';
import { defaultFlashcard } from './default-flashcard';

export const FLASHCARDS_DB_DEFAULT: Flashcard[] = [
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Lazy',
    order: 1,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Bright',
    order: 2,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'single' as const,
    frontUuid: uuid(),
    query: "What's the meaning of word below?",
    context: 'Quick',
    definition: 'Happening or done with great speed.',
    order: 3,
    examples:
      'He made a quick decision to avoid further problems; The quick fox jumped over the lazy dog.',

    keyPoints:
      'Indicates speed or rapidness; Often used to describe actions, movements, or decisions.',

    synonyms: 'fast, swift, speedy, rapid',
    relatedFacts:
      'The word "quick" originates from Old English "cwic," meaning alive or moving; Often used in idioms like "quick as a flash."',
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'single' as const,
    frontUuid: uuid(),
    query: "What's the meaning of word below?",
    context: 'Happy',
    definition: 'Feeling or showing pleasure or contentment.',
    order: 4,
    examples:
      'She felt happy after hearing the good news; The children were happy to play outside.',

    keyPoints:
      'Represents an emotional state of joy or contentment; Often used to describe positive reactions or experiences.',

    synonyms: 'joyful, content, cheerful, pleased',
    relatedFacts:
      'The word "happy" has roots in Middle English, derived from "hap," meaning luck or fortune; Commonly used in phrases like "happy-go-lucky" or "happy ending."',
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'question' as const,
    frontUuid: uuid(),
    query: "What's the meaning of word below?",
    definition: 'Not hard or firm to the touch.',
    order: 5,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'question' as const,
    frontUuid: uuid(),
    query: "What's the meaning of word below?",
    definition: 'Tidy and organized.',
    order: 6,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Kind',
    order: 7,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Quickly',
    order: 8,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Cold',
    order: 9,
  }),
  flashcardsMerge(defaultFlashcard, {
    type: 'index' as const,
    frontUuid: uuid(),
    context: 'Funny',
    order: 10,
  }),
];
