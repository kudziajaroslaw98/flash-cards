import { InputValidation } from '#/components/ui/input/input.component';
import { Dispatch, SetStateAction } from 'react';
import { z } from 'zod';

export default function checkValidity(
  value: string | Record<string, unknown> | undefined,
  scheme: z.ZodType<any>,
  setter?: Dispatch<SetStateAction<boolean>>,
): InputValidation {
  const output = scheme.safeParse(value);
  let valid = false;
  let error: string | undefined = undefined;

  if (output.success) {
    valid = true;
  } else {
    error = output.error.errors?.[0]?.message;
  }

  if (setter) {
    setter(valid);
  }

  return { valid, error };
}
