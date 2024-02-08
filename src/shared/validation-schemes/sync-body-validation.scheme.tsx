import { z } from 'zod';

export const syncBodyValidationScheme = z.object({
  flashcards: z
    .object({
      definition: z.string().min(1),
      order: z.number().nonnegative(),
      frontUuid: z.string().uuid(),
      weight: z.number().nonnegative(),
      word: z.string().min(1),
    })
    .array(),
  stats: z.object({
    accuracy: z.number().nonnegative(),
    answers: z.number().nonnegative(),
    correctAnswers: z.number().nonnegative(),
    createdFlashCards: z.number().nonnegative(),
    incorrectAnswers: z.number().nonnegative(),
  }),
  theme: z.union([z.string().includes('light'), z.string().includes('dark')]),
  lastSyncAt: z.union([z.coerce.date(), z.null()]),
  updatedAt: z.union([z.coerce.date(), z.null()]),
});
