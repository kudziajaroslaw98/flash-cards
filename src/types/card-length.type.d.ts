import { cardLengthSchema } from '#/schemas/card-length.schema';
import { z } from 'zod';

export type CardLength = z.infer<typeof cardLengthSchema>;
