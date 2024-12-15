import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FlashCardSet } from '../models/flash-card-set.model';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const newSetValidationScheme = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description is too long'),
  category: z.string().optional(),
});

export const newSetFormScheme = (
  dictionaryItems: DictionaryValue<string>[],
  handleGenerate: () => void,
  loadingGenerate: boolean,
  isLoggedIn: boolean,
  onAddNew: (value: string) => void,
  isPlanActive: boolean,
): FormScheme<Pick<FlashCardSet, 'name' | 'description' | 'category'>> => ({
  inputs: {
    name: {
      type: 'text',
      name: 'name',
      label: 'Set name',
      placeholder: 'Wild Animals',
    },
    description: {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Set description',
      handleGenerate: handleGenerate,
      loadingGenerate: loadingGenerate,
      blockGenerate: !isLoggedIn || !isPlanActive,
    },
    category: {
      type: 'dropdown',
      multiple: false,
      label: 'Category',
      controlLabel: 'Category',
      config: dictionaryItems,
      addNew: true,
      clearAll: true,
      onAddNew,
    },
  },
  validation: newSetValidationScheme,
});
