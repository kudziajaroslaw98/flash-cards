import { z } from 'zod';

export const learningStyleAdaptationSchema = z.enum(
  [
    'balanced',
    'visual',
    'auditory',
    'reading-writing',
    'kinesthetic',
    'logical',
    'social',
    'solitary',
  ],
  {
    invalid_type_error: 'Learning Style Adaptation is invalid',
    required_error: 'Learning Style Adaptation is required',
    description: 'Learning Style Adaptation',
    message: 'Learning Style Adaptation is invalid',
  },
);
