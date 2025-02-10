import type { ZodEffects, ZodObject, ZodTypeAny } from 'zod';
import type { InputDefinitions } from './input-types';

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
  _internal_default_value?: unknown;
};

export type InputType = InputDefinitions;

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
