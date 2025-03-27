import { contentEmphasisSchema } from '#/schemas/content-emphasis.schema';
import { z } from 'zod';

export type ContentEmphasis = z.infer<typeof contentEmphasisSchema>;
