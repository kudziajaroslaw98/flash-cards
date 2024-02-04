import { UUID } from 'node:crypto';
import { v4 } from 'uuid';

export class FlashCardModel {
  public uuid: UUID = v4() as UUID;
  public weight: number = 0.5;
  public word!: string;
  public definition!: string;
  public order!: number;
}
