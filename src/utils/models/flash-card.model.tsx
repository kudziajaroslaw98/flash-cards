import { UUID } from 'node:crypto';
import { v4 } from 'uuid';

export class FlashCardModel {
  public uuid: UUID = v4() as UUID;
  public word!: string;
  public definition!: string;
  public order!: number;
  public weight!: number;
}
