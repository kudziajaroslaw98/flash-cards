import type { ZodTypeAny } from 'zod';
import type { ExtendedSchemeKeys } from './extended-scheme-keys';

export type InputValidation<T> = {
  key: ExtendedSchemeKeys<T>;
  constraint: ZodTypeAny;
  whenKey?: ExtendedSchemeKeys<T>;
  whenConstraint?: ZodTypeAny;
};
