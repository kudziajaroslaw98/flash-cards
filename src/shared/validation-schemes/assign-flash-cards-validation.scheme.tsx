import { DictionaryValue } from '#/types/dictionary-value.type';
import { FlashCardSet } from '../models/flash-card-set.model';
import type { FlashCard } from '../models/flash-card.model';
import { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const assignFlashCardsValidationScheme = z.object({
  flashCards: z.array(
    z.object({
      frontUuid: z.string().uuid(),
      weight: z.number().nonnegative(),
      question: z.string().min(1),
      questionAddition: z.string().min(1),
      answer: z.string().min(1).max(255),
      order: z.number().nonnegative(),
    }),
  ),
});

export const assignFlashCardsScheme = (
  config: DictionaryValue<FlashCard>[] = [],
): FormScheme<Pick<FlashCardSet, 'flashCards'>> => ({
  inputs: {
    flashCards: {
      type: 'dropdown',
      name: 'flashCards',
      label: 'Flash Cards',
      config: config,
      multiple: true,
      controlLabel: 'Flash Cards',
      multipleLabel: 'Flash Cards',
      searchable: true,
    },
  },
  validation: assignFlashCardsValidationScheme,
});
