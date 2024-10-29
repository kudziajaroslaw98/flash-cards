import type { DropdownProps } from '#/components/ui/dropdown/dropdown.component';
import type { InputComponentProps } from '#/components/ui/input/input.component';
import type { TextAreaProps } from '#/components/ui/text-area/text-area.component';
import type { ZodEffects, ZodObject, ZodTypeAny } from 'zod';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

export type FormScheme<
  T,
  InputType extends
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown> =
    | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
    | TextAreaProps
    | DropdownProps<unknown>,
  SchemeType extends Partial<Record<keyof T, InputType>> = Partial<
    Record<keyof T, InputType>
  >,
> = {
  validation: ZodSchemaFromBaseObject<SchemeType>;
  inputs: SchemeType;
};
