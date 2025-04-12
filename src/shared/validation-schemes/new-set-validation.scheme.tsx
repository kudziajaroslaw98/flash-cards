import type { DictionaryValue } from '#/types/dictionary-value.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';
import type { FlashcardSet } from '../../types/flash-card-set.type';

export const newSetFormScheme = (
  dictionaryItems: DictionaryValue<string>[],
  handleGenerate: () => void,
  loadingGenerate: boolean,
  isLoggedIn: boolean,
  onAddNew: (value: string) => void,
  isPlanActive: boolean,
): FormScheme<Pick<FlashcardSet, 'name' | 'description' | 'category'>> => ({
  inputs: {
    name: {
      type: 'input',
      inputType: 'text',
      name: 'name',
      label: 'Set name',
      placeholder: 'Wild Animals',
      required: true,
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
          constraint: z.string().nullish(),
        },
      ],
      _internal_default_value: '',
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Set description',
      required: false,
      handleGenerate: handleGenerate,
      loadingGenerate: loadingGenerate,
      blockGenerate: !isLoggedIn || !isPlanActive,
    },
    category: {
      name: 'category',
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
