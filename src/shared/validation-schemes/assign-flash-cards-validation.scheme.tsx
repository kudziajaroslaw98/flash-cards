import { DictionaryValue } from '#/types/dictionary-value.type';
import { FlashCardSet } from '../models/flash-card-set.model';
import { FormScheme } from '#/types/form-scheme.type';
import { UUID } from '#/types/uuid.type';
import { z } from 'zod';

export const assignFlashCardsValidationScheme = z.object({
  flashCards: z.array(z.string().uuid()),
});

export const assignFlashCardsScheme = (
  config: DictionaryValue<UUID>[] = [],
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
