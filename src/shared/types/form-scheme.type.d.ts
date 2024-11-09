import type { DropdownProps } from '#/components/ui/dropdown/dropdown.component';
import type { InputComponentProps } from '#/components/ui/input/input.component';
import type { TextAreaProps } from '#/components/ui/text-area/text-area.component';
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
