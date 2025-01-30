import type { DropdownProps } from '#/components/_ui/dropdown/dropdown';
import type { InputComponentProps } from '#/components/_ui/input/input';
import type { TagInputComponentProps } from '#/components/_ui/tag-input/tag-input';
import type { TextAreaProps } from '#/components/_ui/text-area/text-area';
import type { ZodEffects, ZodObject, ZodTypeAny } from 'zod';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

export type InputValidation<T> = {
  key: keyof T;
  constraint: ZodTypeAny;
  whenKey?: keyof T;
  whenConstraint?: ZodTypeAny;
};

export type InternalConstraint<T = unknown> = {
  key: keyof T;
  constraint: ZodTypeAny;
} & (
  | {
      type: 'show';
    }
  | { type: 'prop'; propName: string; propValue: unknown }
  | { type: 'validation'; whenKey?: keyof T; whenConstraint?: ZodTypeAny }
);

export type InternalCommands<T> = {
  _internal_constraints?: InternalConstraint<T>[];
};

export type InputType =
  | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
  | TextAreaProps
  | DropdownProps<unknown>
  | Omit<TagInputComponentProps, 'value' | 'error' | 'valid'>;

export type ExtendedInputType<T, K> = T & InternalCommands<K>;

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
  inputs: SchemeType;
};
