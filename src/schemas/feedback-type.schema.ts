import { z } from 'zod';

export const feedbackTypeSchema = z.enum(
  ['bug', 'feature', 'general', 'other'],
  {
    invalid_type_error: 'Invalid feedback type',
    required_error: 'Feedback type is required',
  },
);
