import { z } from 'zod';

export const newSetValidationScheme = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description is too long'),
});
