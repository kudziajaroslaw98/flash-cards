'use client';

import { isInternalInput } from '#/shared/guards/is-internal-input';
import type { ExtendedSchemeKeys } from '#/types/extended-scheme-keys';
import type { FormScheme, InternalConstraint } from '#/types/form-scheme.type';
import type { InternalAccordion } from '#/types/input-types';
import { useMemo, type FormEvent } from 'react';
import { Accordion } from '../_ui/accordion/accordion';
import { Separator } from '../_ui/separator/separator';
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
    () => Object.entries(inputs).filter(([inputName]) => !isHidden(inputName)),
    [inputs, inputsVisibility],
  );

  return (
    <>
      {visibleInputs.map(([inputName], index) => {
        const input = inputs[inputName as ExtendedSchemeKeys<T>];
        const isInternal = isInternalInput(inputName);

        const isSeparator = input?.type === '_internal_separator';
        const isAccordion = input?.type === '_internal_accordion';
        const isGroupTitle = input?.type === '_internal_group_title';

        let accordionInputs: InternalAccordion<T>['inputs'] = {};

        if (isAccordion) {
          const accordionInput = input as InternalAccordion<T>;
          accordionInputs = accordionInput.inputs;
        }

        if (isInternal) {
          if (isSeparator) {
            return (
              <Separator
                key={`form-item-${inputName}-${index}`}
                type='_internal_separator'
                className='my-4'
                name={inputName}
              />
            );
          } else if (isAccordion) {
            return (
              <Accordion
                key={`form-item-${inputName}-${index}`}
                className='-px-4 py-2'
              >
                <Accordion.Item
                  title={input.title}
                  variant='form'
                >
                  <FormInputsComponent
                    inputs={accordionInputs}
                    formValues={formValues}
                    inputsValidity={inputsValidity}
                    inputsErrors={inputsErrors}
                    inputsVisibility={inputsVisibility}
                    touchedInputs={touchedInputs}
                    handleOnInput={handleOnInput}
                    handleOnChange={handleOnChange}
                    handleOnBlur={handleOnBlur}
                    handleOnFocus={handleOnFocus}
                  />
                </Accordion.Item>
              </Accordion>
            );
          } else if (isGroupTitle) {
            return (
              <div
                key={`form-item-${inputName}-${index}`}
                className='flex flex-col'
              >
                <h6 className='mt-4'>{input.title}</h6>
                <hr className='mb-4 mt-2 border-gray-200 dark:border-slate-900' />
              </div>
            );
          } else {
            return (
              <FormInput<T>
                key={`form-item-${inputName}-${index}`}
                anyTouched={anyTouched}
                index={index}
                inputName={inputName}
                inputProps={inputs[inputName as ExtendedSchemeKeys<T>]!}
                handleOnInput={handleOnInput}
                handleOnChange={handleOnChange}
                handleOnBlur={handleOnBlur}
                handleOnFocus={handleOnFocus}
                value={formValues[inputName]}
                touched={touchedInputs[inputName]}
                valid={inputsValidity[inputName]}
                error={inputsErrors[inputName]}
                constraintProps={
                  inputs[
                    inputName as ExtendedSchemeKeys<T>
                  ]!._internal_constraints?.filter(isPropConstraint) ?? []
                }
              />
            );
          }
        } else {
          return (
            <FormInput<T>
              key={`form-item-${inputName}-${index}`}
              anyTouched={anyTouched}
              index={index}
              inputName={inputName}
              inputProps={inputs[inputName as ExtendedSchemeKeys<T>]!}
              handleOnInput={handleOnInput}
              handleOnChange={handleOnChange}
              handleOnBlur={handleOnBlur}
              handleOnFocus={handleOnFocus}
              value={formValues[inputName]}
              touched={touchedInputs[inputName]}
              valid={inputsValidity[inputName]}
              error={inputsErrors[inputName]}
              constraintProps={
                inputs[
                  inputName as ExtendedSchemeKeys<T>
                ]!._internal_constraints?.filter(isPropConstraint) ?? []
              }
            />
          );
        }
      })}
    </>
  );
}
