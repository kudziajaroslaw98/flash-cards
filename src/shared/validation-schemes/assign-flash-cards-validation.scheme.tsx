import { DictionaryValue } from '#/types/dictionary-value.type';
import type { FormScheme } from '#/types/form-scheme.type';

import { z } from 'zod';
import { FlashcardSet } from '../../types/flash-card-set.type';

export const assignFlashcardsScheme = (
  config: DictionaryValue<string>[] = [],
): FormScheme<Pick<FlashcardSet, 'flashcards'>> => ({
  inputs: {
    flashcards: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'flashcards',
          constraint: z.array(z.string().uuid()),
        },
      ],
      type: 'dropdown',
      name: 'flashcards',
      label: 'Flashcards',
      config: config,
      multiple: true,
      controlLabel: 'Flashcards',
      multipleLabel: 'Flashcards',
      searchable: true,
      clearAll: true,
    },
  },
});
