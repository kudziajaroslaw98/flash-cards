import { UUID } from '#/types//uuid.type';
import { v4 } from 'uuid';

export type FlashCard = {
  [key: string]: unknown;
} & FlashCardClass;
class FlashCardClass {
  public frontUuid: UUID = v4() as UUID;
  public weight: number = 0.5;
  public question!: string;
  public questionAddition!: string;
  public answer!: string;
  public order!: number;
}
