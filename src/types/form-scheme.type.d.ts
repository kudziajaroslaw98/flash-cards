import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { ZodEffects, ZodObject, ZodTypeAny } from 'zod';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

type InternalCommands<K> = {
  _internal_constraints?: {
    key: keyof K;
    constraint: ZodTypeAny;
  }[];
};

export type InputType =
  | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
  | TextAreaProps
  | DropdownProps<unknown>;

type ExtendedInputType<T, K> = T & InternalCommands<K>;

export type FormScheme<
  T,
  Input extends ExtendedInputType<InputType, T> = ExtendedInputType<
    InputType,
    T
  >,
  SchemeType extends Partial<Record<keyof T, Input>> = Partial<
    Record<keyof T, Input>
  >,
> = {
  validation: ZodSchemaFromBaseObject<SchemeType>;
  inputs: SchemeType;
};
