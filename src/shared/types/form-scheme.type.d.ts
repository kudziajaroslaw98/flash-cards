import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { ZodEffects, ZodObject, ZodTypeAny } from 'zod';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

export type InputType =
  | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
  | TextAreaProps
  | DropdownProps<unknown>;

export type FormScheme<
  T,
  Input extends InputType = InputType,
  SchemeType extends Partial<Record<keyof T, Input>> = Partial<
    Record<keyof T, Input>
  >,
> = {
  validation: ZodSchemaFromBaseObject<SchemeType>;
  inputs: SchemeType;
};
