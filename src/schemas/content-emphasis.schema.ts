import { z } from 'zod';

export const contentEmphasisSchema = z.enum(
  [
    'balanced',
    'fundamentals',
    'edge-cases',
    'current-trends',
    'historical',
    'practical',
    'theoretical',
    'controversial',
    'technical',
    'conceptual',
  ],
  {
    invalid_type_error: 'Content Emphasis is invalid',
    required_error: 'Content Emphasis is required',
    description: 'Content Emphasis',
    message: 'Content Emphasis is invalid',
  },
);
