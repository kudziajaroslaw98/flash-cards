import { z } from 'zod';

export const preferredQuestionFormatsSchema = z.enum(
  [
    'balanced',
    'application',
    'compare-contrast',
    'problem-solving',
    'definition',
    'cause-effect',
    'process',
    'analysis',
    'evaluation',
    'recall',
  ],
  {
    invalid_type_error: 'Preferred Question Format is invalid',
    required_error: 'Preferred Question Format is required',
    description: 'Preferred Question Format',
    message: 'Preferred Question Format is invalid',
  },
);
