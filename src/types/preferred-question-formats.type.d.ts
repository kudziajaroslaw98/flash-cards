import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { z } from 'zod';

export type PreferredQuestionFormats = z.infer<typeof knowledgeLevelSchema>;
