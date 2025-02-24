import { planTypeSchema } from '#/schemas/plan-types.schema';
import { z } from 'zod';

export type PlanType = z.infer<typeof planTypeSchema>;
