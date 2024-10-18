import { UUID } from '#/shared/types/uuid.type';
import { FlashCardSet } from '../models/flashcard-set.model';

export type Sets = Record<UUID, FlashCardSet>;
