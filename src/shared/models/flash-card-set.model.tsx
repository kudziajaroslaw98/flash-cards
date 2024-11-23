import { UUID } from '#/types/uuid.type';

export type FlashCardSet = {
  frontUuid: UUID;
  name: string;
  description: string;
  flashCards: UUID[];
  isFavourite: boolean;
  category?: string;
  hardlink: string;
};
