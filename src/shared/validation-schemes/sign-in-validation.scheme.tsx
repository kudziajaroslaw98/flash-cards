import { z } from 'zod';

export const signInValidationScheme = z.object({
  email: z.string().email('Email is incorrect.'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
