import { UUID } from '#/shared/types/uuid.type';
import { FlashCardSet } from '../models/flash-card-set.model';

export type Sets = Record<UUID, FlashCardSet>;
