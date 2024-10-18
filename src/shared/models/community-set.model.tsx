import { UUID } from '../types/uuid.type';
import { FlashCardSet } from './flashcard-set.model';

export type CommunitySet = FlashCardSet & {
  isPublic: boolean;
  creatorId: string;
  createdAt: Date;
  favouriteCount: number;
  uuid: UUID;
};
