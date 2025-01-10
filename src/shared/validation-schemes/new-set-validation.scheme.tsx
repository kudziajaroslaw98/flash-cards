import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';
import type { FlashCardSet } from '../../types/flash-card-set.type';

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
      _internal_constraints: [
        {
          type: 'validation',
          key: 'name',
          constraint: z.string().min(1, 'Name is required'),
        },
      ],
    },
    description: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'description',
          constraint: z
            .string()
            .min(1, 'Description is required')
            .max(255, 'Description is too long'),
        },
      ],
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Set description',
      handleGenerate: handleGenerate,
      loadingGenerate: loadingGenerate,
      blockGenerate: !isLoggedIn || !isPlanActive,
    },
    category: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'category',
          constraint: z.string().optional(),
        },
      ],
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
});
