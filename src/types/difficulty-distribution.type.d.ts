import { difficultyDistributionSchema } from '#/schemas/difficulty-distribution.schema';
import { z } from 'zod';

export type DifficultyDistribution = z.infer<
  typeof difficultyDistributionSchema
>;
