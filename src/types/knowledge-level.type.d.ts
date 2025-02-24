import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { z } from 'zod';

export type KnowledgeLevel = z.infer<typeof knowledgeLevelSchema>;
