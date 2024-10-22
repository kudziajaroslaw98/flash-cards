import { z } from 'zod';
import { DictionaryValue } from '../types/dictionary-value.type';

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
) => ({
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
    },
    category: {
      type: 'dropdown',
      multiple: false,
      label: 'Category',
      controlLabel: 'Category',
      config: dictionaryItems,
      addNew: true,
      clearAll: true,
    },
  },
  validation: newSetValidationScheme,
});
