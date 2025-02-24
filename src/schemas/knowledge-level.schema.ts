import { z } from 'zod';

export const knowledgeLevelSchema = z.enum(
  ['unfamiliar', 'beginner', 'developing', 'proficient', 'advanced', 'expert'],
  {
    invalid_type_error: 'Knowledge Level is invalid',
    required_error: 'Knowledge Level is required',
    description: 'Knowledge Level',
    message: 'Knowledge Level is invalid',
  },
);
