import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { z } from 'zod';

export type LearningStyleAdaptation = z.infer<
  typeof learningStyleAdaptationSchema
>;
