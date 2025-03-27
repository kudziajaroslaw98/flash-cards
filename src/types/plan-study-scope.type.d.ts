import { planStudyScopeSchema } from '#/schemas/plan-study-scope.schema';
import { z } from 'zod';

export type PlanStudyScope = z.infer<typeof planStudyScopeSchema>;
