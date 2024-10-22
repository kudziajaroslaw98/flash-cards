import { UUID } from '#/shared/types/uuid.type';
import { v4 } from 'uuid';

export class FlashCard {
  public frontUuid: UUID = v4() as UUID;
  public weight: number = 0.5;
  public question!: string;
  public questionAddition!: string;
  public answer!: string;
  public order!: number;
}
