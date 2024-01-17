import { FlashCardModel } from '#/utils/models/flash-card.model';
import { UUID } from 'node:crypto';


export type FlashCards = Record<UUID, FlashCardModel>;
