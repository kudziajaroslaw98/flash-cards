'use client';

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import type { SafeParseError, SafeParseSuccess, ZodIssueBase } from 'zod';
import { isDifferent } from '#/shared/utils/is-different.util';
import isTextArea from '#/shared/guards/is-text-area.guard';
import isDropdown from '#/shared/guards/is-dropdown.guard';
import { FormScheme } from '#/types//form-scheme.type';
import isInput from '#/shared/guards/is-input.guard';
import TextArea from '../_ui/text-area/text-area';
import Input from '#/components/_ui/input/input';
import Dropdown from '../_ui/dropdown/dropdown';

export default function FormComponent<T>(props: {
  scheme: FormScheme<T>;
  initialValues?: T;
  emitFormValid?: Dispatch<SetStateAction<boolean>>;
  emitFormValue: Dispatch<SetStateAction<Partial<T>>>;
  className?: string;
  formValid?: boolean;
  formError?: string;
  debug?: {
    inputs?: boolean;
    validity?: boolean;
    errors?: boolean;
    values?: boolean;
    touch?: boolean;
  };
}) {
  const [inputsValidity, setInputsValidity] = useState<Record<string, boolean>>(
    {},
  );
  const [inputsErrors, setInputsErrors] = useState<
    Record<string, string | null>
  >({});

  const [defaultValids, setDefaultValids] = useState<Record<string, boolean>>(
    {},
  );
  const [formValues, setFormValues] = useState<
    Record<string, unknown | unknown[]>
  >({});
  const [formInputs, setFormInputs] = useState<string[]>([]);
  const [touchedInputs, setTouchedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const initialValuesRef = useRef<T | null>(null);

  useEffect(() => {
    if (
      initialValuesRef.current === null ||
      isDifferent(initialValuesRef.current, props.initialValues)
    ) {
      let initialInputs: string[] = [];
      let initialValids: Record<string, boolean> = {};
      let initialErrors: Record<string, string | null> = {};
      let tmpValues: Record<string, string> = {};

      Object.entries(props.scheme.inputs).forEach(([inputName]) => {
        initialInputs = [...initialInputs, inputName];
        initialValids = { ...initialValids, [inputName]: true };
        initialErrors = { ...initialErrors, [inputName]: null };
        tmpValues = {
          ...tmpValues,
          // @ts-expect-error Generic type generate error here
          [inputName]: props.initialValues?.[inputName]
            ? // @ts-expect-error  Generic type generate error here
              props.initialValues?.[inputName]
            : '',
        };
      });

      const initialValues: Record<keyof T, string> = {
        ...props.initialValues,
        ...tmpValues,
      } as Record<keyof T, string>;

      setFormInputs(initialInputs);
      setInputsValidity(initialValids);
      setInputsErrors(initialErrors);
      setFormValues(initialValues);
      setDefaultValids(initialValids);
      initialValuesRef.current = props.initialValues ?? null;
    }
  }, [props.initialValues, props.scheme.inputs]);

  useEffect(() => {
    if (props?.formValid !== undefined && props?.formValid === false) {
      let initialValids = { ...inputsValidity };
      let initialErrors = { ...inputsErrors };

      Object.entries(props.scheme.inputs).forEach(([inputName]) => {
        initialValids = {
          ...initialValids,
          [inputName]: props.formValid as boolean,
        };
        initialErrors = { ...initialErrors, [inputName]: '' };
      });

      setInputsValidity(initialValids);
      setInputsErrors(initialErrors);
    }
  }, [props.formValid]);

  useEffect(() => {
    if (props?.debug?.inputs) {
      console.log('form - inputs - ', formInputs);
    }
  }, [props.debug, formInputs]);

  useEffect(() => {
    if (props?.debug?.validity) {
      console.log('form - valids - ', inputsValidity);
    }
  }, [props.debug, inputsValidity]);

  useEffect(() => {
    if (props?.debug?.errors) {
      console.log('form - errors - ', inputsErrors);
    }
  }, [props.debug, inputsErrors]);

  useEffect(() => {
    if (props?.debug?.values) {
      console.log('form - values - ', formValues);
    }
  }, [props.debug, formValues]);

  useEffect(() => {
    if (props?.debug?.touch) {
      console.log('form - touched - ', touchedInputs);
    }
  }, [props.debug, touchedInputs]);

  const checkFormValidity = () => {
    const output: SafeParseSuccess<unknown> | SafeParseError<unknown> =
      props.scheme.validation.safeParse(formValues);

    let valids = defaultValids;
    let errors = {};

    if (!output.success) {
      const issues = output?.error?.issues;
      const haveErrors = issues?.length > 0;

      if (haveErrors) {
        issues.forEach((issue: ZodIssueBase) => {
          if (touchedInputs[issue.path[0]]) {
            valids = { ...valids, [issue.path[0]]: false };
            errors = { ...errors, [issue.path[0]]: issue.message };
          }
        });
      }
    }

    setInputsErrors(errors);
    setInputsValidity(valids);
    props.emitFormValid &&
      props.emitFormValid(Object.values(valids).every((item) => item));
  };

  const handleOnInput = (
    event: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    inputName: string,
  ) => {
    props.emitFormValue({
      ...formValues,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    } as T);

    setFormValues((prev) => ({
      ...prev,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    }));
  };

  const handleOnChange = (value: unknown | unknown[], inputName: string) => {
    props.emitFormValue({
      ...formValues,
      [inputName]: value,
    } as T);

    setFormValues((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const handleOnBlur = () => {
    checkFormValidity();
  };

  const handleOnFocus = (inputName: string) => {
    setTouchedInputs((prev) => ({ ...prev, [inputName]: true }));
  };

  return (
    <form className={props.className}>
      {Object.entries(props.scheme.inputs).map(([inputName, inputProps]) => {
        return (
          <span key={inputName}>
            {/* @ts-expect-error We need to have possibility to edit only few attributes from object. Thats why we use Partial, but with it comes the error that the inputProps is unknown.*/}

            {isTextArea(inputProps) && (
              <TextArea
                {...inputProps}
                key={inputName}
                value={formValues[inputName] as string}
                valid={
                  touchedInputs[inputName] ? inputsValidity[inputName] : true
                }
                error={
                  touchedInputs[inputName] ? inputsErrors[inputName] : null
                }
                touched={touchedInputs[inputName]}
                onInput={(e) => handleOnInput(e, inputName)}
                onFocus={() => handleOnFocus(inputName)}
                onBlur={handleOnBlur}
              ></TextArea>
            )}

            {/* @ts-expect-error We need to have possibility to edit only few attributes from object. Thats why we use Partial, but with it comes the error that the inputProps is unknown.*/}

            {isDropdown(inputProps) && (
              <Dropdown
                {...inputProps}
                key={inputName}
                value={formValues[inputName]}
                valid={
                  touchedInputs[inputName] ? inputsValidity[inputName] : true
                }
                error={
                  touchedInputs[inputName] ? inputsErrors[inputName] : null
                }
                touched={touchedInputs[inputName]}
                onChange={(e) => handleOnChange(e, inputName)}
                onFocus={() => handleOnFocus(inputName)}
                onBlur={handleOnBlur}
              ></Dropdown>
            )}

            {/* @ts-expect-error We need to have possibility to edit only few attributes from object. Thats why we use Partial, but with it comes the error that the inputProps is unknown.*/}

            {isInput(inputProps) && (
              <Input
                {...inputProps}
                key={inputName}
                valid={
                  touchedInputs[inputName] ? inputsValidity[inputName] : true
                }
                error={
                  touchedInputs[inputName] ? inputsErrors[inputName] : null
                }
                touched={touchedInputs[inputName]}
                value={(formValues[inputName] as string) ?? ''}
                onInput={(e) => handleOnInput(e, inputName)}
                onFocus={() => handleOnFocus(inputName)}
                onBlur={handleOnBlur}
              />
            )}
          </span>
        );
      })}

      {props.formError && (
        <span
          className={`${
            props.formError ? 'mt-6 max-h-12 opacity-100' : ' max-h-0 opacity-0'
          } flex w-full items-center justify-center px-6 text-sm text-red-400 transition-all duration-700 ease-in-out`}
        >
          {props.formError}
        </span>
      )}
    </form>
  );
}
