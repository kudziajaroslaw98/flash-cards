import { InputValidation } from './input-validation.type';

export type FormState<T> = {
  inputsValidity: Record<string, boolean>;
  inputsVisibility: Record<string, boolean>;
  inputsErrors: Record<string, string | null>;
  inputValidations: Record<string, InputValidation<T>[]>;
  defaultValids: Record<string, boolean>;
  formValues: Record<string, unknown | unknown[]>;
  formInputs: string[];
  formValidity: boolean;
  touchedInputs: Record<string, boolean>;
};
