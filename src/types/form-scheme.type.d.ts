import type { ZodTypeAny } from 'zod';
import type { ExtendedSchemeKeys } from './extended-scheme-keys';
import type { InputDefinitions } from './input-types';

/**
 * Represents an internal constraint that can be applied to a schema.
 *
 * @typedef {Object} InternalConstraint
 * @description Represents an internal constraint that can be applied to a schema to control the behavior of the form control.
 * @template T
 * @property {('show' | 'prop' | 'validation')} type - The type of constraint.
 * @property {ExtendedSchemeKeys<T>} key - The key to which the constraint applies - key of generic T or internal form field starting with _internal_.
 * @property {ZodTypeAny} zod validation schema - The constraint to apply.
 *
 * @property {string} [propName] - The name of the property to which the constraint applies (only for `type: 'prop'`).
 * @property {unknown} [propValue] - The value of the property to which the constraint applies (only for `type: 'prop'`).
 *
 * @property {ExtendedSchemeKeys<T>} [whenKey] - The key to which the constraint applies when the condition is met (only for `type: 'validation'`).
 * @property {ZodTypeAny} [whenConstraint] - The constraint to apply when the condition is met (only for `type: 'validation'`).
 */
export type InternalConstraint<T> = (
  | {
      type: 'show';
    }
  | { type: 'prop'; propName: string; propValue: unknown }
  | {
      type: 'validation';
      whenKey?: ExtendedSchemeKeys<T>;
      whenConstraint?: ZodTypeAny;
    }
) & {
  /**
   * @description The key to which the constraint applies - key of generic T or internal form field starting with '\_internal\_'.
   * @type {ExtendedSchemeKeys<T>}
   */
  key: ExtendedSchemeKeys<T>;
  constraint: ZodTypeAny;
};

export type InternalCommands<T> = {
  _internal_constraints?: InternalConstraint<T>[];
  _internal_default_value?: unknown;
  _internal_include_in_output?: boolean;
};

export type InputType<T> = InputDefinitions<T>;

export type ExtendedInputType<T, K> = T & InternalCommands<K>;

export type FormScheme<
  T,
  Input extends ExtendedInputType<InputType<T>, T> = ExtendedInputType<
    InputType<T>,
    T
  >,
  SchemeType extends Partial<Record<ExtendedSchemeKeys<T>, Input>> = Partial<
    Record<ExtendedSchemeKeys<T>, Input>
  >,
> = {
  inputs: SchemeType;
};
