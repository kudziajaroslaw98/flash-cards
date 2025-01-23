import { DictionaryValue } from '#/types/dictionary-value.type';
import { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';
import { FlashCardSet } from '../../types/flash-card-set.type';

export const assignFlashCardsScheme = (
  config: DictionaryValue<string>[] = [],
): FormScheme<Pick<FlashCardSet, 'flashCards'>> => ({
  inputs: {
    flashCards: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'flashCards',
          constraint: z.array(z.string().uuid()),
        },
      ],
      type: 'dropdown',
      name: 'flashCards',
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
