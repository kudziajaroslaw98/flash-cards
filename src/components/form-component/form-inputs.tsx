'use client';

import type { FormScheme, InternalConstraint } from '#/types/form-scheme.type';
import { AnimatePresence } from 'framer-motion';
import { useMemo, type FormEvent } from 'react';
import FormInput from './form-input';

type FormInputsProps<T> = {
  inputs: FormScheme<T>['inputs'];
  formValues: Record<string, unknown | unknown[]>;
  handleOnInput: (
    e: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    key: string,
  ) => void;
  handleOnChange: (value: unknown | unknown[], key: string) => void;
  handleOnFocus: (key: string) => void;
  handleOnBlur: () => void;
  touchedInputs: Record<string, boolean>;
  inputsValidity: Record<string, boolean>;
  inputsErrors: Record<string, string | null>;
  inputsVisibility: Record<string, boolean>;
};

export default function FormInputsComponent<T>({
  inputs,
  formValues,
  handleOnInput,
  handleOnChange,
  handleOnBlur,
  handleOnFocus,
  touchedInputs,
  inputsValidity,
  inputsErrors,
  inputsVisibility,
}: FormInputsProps<T>) {
  const anyTouched = Object.values(touchedInputs).some((value) => value);
  const isPropConstraint = (item: InternalConstraint<T>) => {
    return (
      item.type === 'prop' &&
      item.constraint.safeParse(formValues?.[item.key as string]).success
    );
  };

  const isHidden = (inputName: string) => {
    return !inputsVisibility[inputName];
  };

  const visibleInputs = useMemo(
    () =>
      Object.entries(inputsVisibility).filter(
        ([inputName]) => !isHidden(inputName),
      ),
    [inputsVisibility],
  );

  return (
    <AnimatePresence>
      {visibleInputs.map(([inputName], index) => {
        return (
          <FormInput<T>
            key={`form-item-${inputName}-${index}`}
            anyTouched={anyTouched}
            index={index}
            inputName={inputName}
            inputProps={inputs[inputName as keyof T]!}
            handleOnInput={handleOnInput}
            handleOnChange={handleOnChange}
            handleOnBlur={handleOnBlur}
            handleOnFocus={handleOnFocus}
            value={formValues[inputName]}
            touched={touchedInputs[inputName]}
            valid={inputsValidity[inputName]}
            error={inputsErrors[inputName]}
            constaintProps={
              inputs[inputName as keyof T]!._internal_constraints?.filter(
                isPropConstraint,
              ) ?? []
            }
          />
        );
      })}
    </AnimatePresence>
  );
}
