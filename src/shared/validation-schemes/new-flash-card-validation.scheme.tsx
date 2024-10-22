import { z } from 'zod';

export const newFlashCardValidationScheme = z.object({
  word: z.string().min(1, 'Word is required'),
  definition: z
    .string()
    .min(1, 'Definition is required')
    .max(255, 'Definition is too long'),
});

export const newFlashCardScheme = {
  inputs: {
    word: {
      type: 'text',
      name: 'name',
      label: 'Word',
      placeholder: 'Your new word',
    },
    definition: {
      type: 'textarea',
      name: 'definition',
      label: 'Definition',
      placeholder: 'Definition of your new word',
    },
  },
  validation: newFlashCardValidationScheme,
};
