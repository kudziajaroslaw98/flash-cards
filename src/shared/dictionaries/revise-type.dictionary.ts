import { FlashCardTypesEnum } from '../enums/flash-card-types.enum';
import { DictionaryValue } from '../types/dictionary-value.type';

export const reviseTypeDictionary: Record<
  FlashCardTypesEnum,
  DictionaryValue<FlashCardTypesEnum>
> = {
  GUESS_DEFINITION: {
    value: FlashCardTypesEnum.GUESS_DEFINITION,
    label: 'Guess Definition',
  },
  GUESS_NAME: {
    value: FlashCardTypesEnum.GUESS_NAME,
    label: 'Guess Name',
  },
  SHOW_ALL: {
    value: FlashCardTypesEnum.SHOW_ALL,
    label: 'Show All',
  },
} as const;
