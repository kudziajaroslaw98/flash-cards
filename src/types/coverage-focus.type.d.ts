import { coverageFocusSchema } from '#/schemas/coverage-focus.schema';
import { z } from 'zod';

export type CoverageFocus = z.infer<typeof coverageFocusSchema>;
