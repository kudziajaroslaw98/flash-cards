import { InputValidation } from '#/components/ui/input/input.component';
import type { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';

export default function checkValidity(
  value: string | Record<string, unknown> | undefined,
  scheme: z.ZodType<unknown>,
  setter?: Dispatch<SetStateAction<boolean>>,
): InputValidation {
  const output = scheme.safeParse(value);
  let valid = false;
  let error: string | undefined = undefined;

  let response: InputValidation;

  if (output.success) {
    valid = true;
    response = { valid: true };
  } else {
    error = output.error.errors[0].message;
    response = { valid: false, error };
  }

  if (setter) {
    setter(valid);
  }

  return response;
}
