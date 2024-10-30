import { FlashCard } from '#/shared/models/flash-card.model';
import { UUID } from '#/shared/types/uuid.type';

export type FlashCards = Record<UUID, FlashCard>;
