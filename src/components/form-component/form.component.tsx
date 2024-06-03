'use client';

import Input, {
  InputComponentProps,
} from '#/components/ui/input/input.component';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import type {
  SafeParseError,
  SafeParseSuccess,
  ZodEffects,
  ZodIssueBase,
  ZodObject,
  ZodTypeAny,
} from 'zod';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

type FormScheme<T> = {
  validation: ZodSchemaFromBaseObject<T>;
  inputs: T;
};

export default function FormComponent<
  T extends Record<
    string,
    Omit<InputComponentProps, 'value' | 'error' | 'valid'>
  >,
>(props: {
  scheme: FormScheme<T>;
  initialValues?: Partial<Record<keyof T, string>>;
  emitFormValid: Dispatch<SetStateAction<boolean>>;
  emitFormValue: Dispatch<SetStateAction<Partial<Record<keyof T, string>>>>;
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
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formInputs, setFormInputs] = useState<string[]>([]);
  const [touchedInputs, setTouchedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      let initialInputs: string[] = [];
      let initialValids = {};
      let initialErrors = {};
      let initialValues = {};

      Object.entries(props.scheme.inputs).forEach(([inputName]) => {
        initialInputs = [...initialInputs, inputName];
        initialValids = { ...initialValids, [inputName]: true };
        initialErrors = { ...initialErrors, [inputName]: null };
        initialValues = {
          ...initialValues,
          [inputName]: props.initialValues?.[inputName]
            ? props.initialValues?.[inputName]
            : '',
        };
      });

      setFormInputs(initialInputs);
      setInputsValidity(initialValids);
      setInputsErrors(initialErrors);
      setFormValues(initialValues);
      setDefaultValids(initialValids);

      initialRender.current = false;
    }
  }, [props.initialValues, props.scheme]);

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
    props.emitFormValid(Object.values(valids).every((item) => item));
  };

  return (
    <form>
      {Object.entries(props.scheme.inputs).map(([inputName, inputProps]) => {
        return (
          <Input
            {...inputProps}
            key={inputName}
            valid={touchedInputs[inputName] ? inputsValidity[inputName] : true}
            error={touchedInputs[inputName] ? inputsErrors[inputName] : null}
            value={formValues[inputName] ?? ''}
            onFocus={(e) => {
              if (inputProps.onFocus) {
                inputProps.onFocus(e);
              }

              setTouchedInputs({ ...touchedInputs, [inputName]: true });
            }}
            onBlur={(e) => {
              if (inputProps.onBlur) {
                inputProps.onBlur(e);
              }

              checkFormValidity();
            }}
            onInput={(e) => {
              if (inputProps.onInput) {
                inputProps.onInput(e);
              }

              props.emitFormValue({
                ...formValues,
                [inputName]: e.currentTarget.value,
              } as Partial<Record<keyof T, string>>);

              setFormValues({
                ...formValues,
                [inputName]: e.currentTarget.value,
              });
            }}
          />
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
