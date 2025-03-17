import type { DateTimePickerProps } from '#/components/_ui/date-picker/date-picker';
import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputSwitchProps } from '#/components/_ui/input-switch/input-switch';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { ExtendedSchemeKeys } from './extended-scheme-keys';
import type { ExtendedInputType } from './form-scheme.type';

export type InternalSeparator = {
  type: '_internal_separator';
  name: string;
};

export type InternalAccordion<T> = {
  type: '_internal_accordion';
  name: string;
  title: string;
  inputs: Partial<
    Record<ExtendedSchemeKeys<T>, ExtendedInputType<InputDefinitions<T>, T>>
  >;
};

export type VanillaInputType = Omit<
  InputComponentProps,
  'value' | 'error' | 'valid'
> & {
  type: 'input';
};

export type InternalInputTypes<T> = InternalSeparator | InternalAccordion<T>;

export type InputDefinitions<T> =
  | VanillaInputType
  | Omit<InputSwitchProps, 'value' | 'error' | 'valid'>
  | Omit<TagInputComponentProps, 'value' | 'error' | 'valid'>
  | Omit<TextAreaProps, 'value' | 'error' | 'valid'>
  | Omit<DropdownProps<unknown>, 'onChange'>
  | Omit<DateTimePickerProps, 'value' | 'error' | 'valid'>
  | InternalSeparator
  | InternalAccordion<T>;
