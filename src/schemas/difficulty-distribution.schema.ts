import { z } from 'zod';

export const difficultyDistributionSchema = z.enum(
  [
    'balanced',
    'beginner-focused',
    'advanced-focused',
    'progressive',
    'challenging',
    'accessible',
    'expert',
    'introductory',
  ],
  {
    invalid_type_error: 'Difficulty Distribution is invalid',
    required_error: 'Difficulty Distribution is required',
    description: 'Difficulty Distribution',
    message: 'Difficulty Distribution is invalid',
  },
);
