import { z } from 'zod';
export const planTypeSchema = z.enum(
  ['overview', 'deep-dive', 'quick-review', 'exam-prep'],
  {
    invalid_type_error: 'Plan Type is invalid',
    required_error: 'Plan Type is required',
    description: 'Plan Type',
    message: 'Plan Type is invalid',
  },
);
