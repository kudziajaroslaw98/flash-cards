import { z } from 'zod';

export const planDurationSchema = z.enum(['1', '3', '5', '7', '14', '30'], {
  invalid_type_error: 'Duration is invalid',
  required_error: 'Duration is required',
  description: 'Duration in days',
  message: 'Duration is invalid',
});
