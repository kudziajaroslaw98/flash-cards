import { FlashCardSet } from './flash-card-set.model';
import { UUID } from '#/types/uuid.type';

export type CommunitySet = FlashCardSet & {
  isPublic: boolean;
  creatorId: string;
  createdAt: Date;
  favouriteCount: number;
  uuid: UUID;
};
