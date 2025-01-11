export type FlashCardSet = {
  frontUuid: string;
  name: string;
  description: string;
  flashCards: string[];
  isFavourite: boolean;
  category?: string;
  hardlink: string;
  createdAt: string;
  updatedAt: string;
};
