import { z } from 'zod';

export const newSetValidationScheme = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description is too long'),
});

export const newSetFormScheme = {
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
    },
  },
  validation: newSetValidationScheme,
};
