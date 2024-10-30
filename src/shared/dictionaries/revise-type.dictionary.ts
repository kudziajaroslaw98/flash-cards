import { FlashCardTypesEnum } from '../enums/flash-card-types.enum';
import { DictionaryValue } from '../types/dictionary-value.type';

export const reviseTypeDictionary: DictionaryValue<FlashCardTypesEnum>[] = [
  {
    value: FlashCardTypesEnum.GUESS_DEFINITION,
    label: 'Guess Definition',
  },
  {
    value: FlashCardTypesEnum.GUESS_NAME,
    label: 'Guess Name',
  },
  {
    value: FlashCardTypesEnum.SHOW_ALL,
    label: 'Show All',
  },
] as const;
