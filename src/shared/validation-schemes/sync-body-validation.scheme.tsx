import { z } from 'zod';

export const syncBodyValidationScheme = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      questionAddition: z.string().min(1),
      order: z.number().nonnegative(),
      frontUuid: z.string().uuid(),
      weight: z.number().nonnegative(),
    }),
  ),
  metadata: z.object({
    accuracy: z.number().nonnegative(),
    answers: z.number().nonnegative(),
    correctAnswers: z.number().nonnegative(),
    createdFlashCards: z.number().nonnegative(),
    incorrectAnswers: z.number().nonnegative(),
    streak: z.number().nonnegative(),
    lastSyncAt: z.union([z.coerce.date(), z.null()]),
  }),
  sets: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      category: z.string().optional(),
      frontUuid: z.string().uuid(),
      hardlink: z.string().min(1),
      isFavourite: z.boolean(),
      flashCards: z.array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
          questionAddition: z.string().min(1),
          order: z.number().nonnegative(),
          frontUuid: z.string().uuid(),
          weight: z.number().nonnegative(),
        }),
      ),
    }),
  ),
  theme: z.union([z.string().includes('light'), z.string().includes('dark')]),
});
