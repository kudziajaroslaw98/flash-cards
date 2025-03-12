import { z } from 'zod';

export const cardLengthSchema = z.enum(
  ['balanced', 'concise', 'detailed', 'very-concise', 'comprehensive'],
  {
    invalid_type_error: 'Card Length is invalid',
    required_error: 'Card Length is required',
    description: 'Card Length',
    message: 'Card Length is invalid',
  },
);
