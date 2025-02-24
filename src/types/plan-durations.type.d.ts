import { planDurationSchema } from '#/schemas/plan-durations.schema';
import { z } from 'zod';

export type PlanDuration = z.infer<typeof planDurationSchema>;
