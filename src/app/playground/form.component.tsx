'use client';

import InputComponent, {
  InputProps,
} from '#/components/ui/input/input.component';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
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

interface FormScheme<T> {
  validation: ZodSchemaFromBaseObject<T>;
  inputs: T;
}

export default function FormComponent<
  T extends Record<string, Omit<InputProps, 'value' | 'error' | 'valid'>>,
>(props: {
  scheme: FormScheme<T>;
  initialValues?: Partial<Record<keyof T, string>>;
  emitFormValid: Dispatch<SetStateAction<boolean>>;
  emitFormValue: Dispatch<SetStateAction<Partial<Record<keyof T, string>>>>;
  debug?: {
    inputs?: boolean;
    validity?: boolean;
    errors?: boolean;
    values?: boolean;
    touch?: boolean;
  };
}) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formValids, setFormValids] = useState<Record<string, boolean>>({});
  const [defaultValids, setDefaultValids] = useState<Record<string, boolean>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>(
    {},
  );
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

      Object.entries(props.scheme.inputs).forEach(([inputName, _]) => {
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
      setFormValids(initialValids);
      setFormErrors(initialErrors);
      setFormValues(initialValues);
      setDefaultValids(initialValids);

      initialRender.current = false;
    }
  }, [props.initialValues, props.scheme]);

  useEffect(() => {
    if (props?.debug?.inputs) {
      console.log('form - inputs - ', formInputs);
    }
  }, [props.debug, formInputs]);

  useEffect(() => {
    if (props?.debug?.validity) {
      console.log('form - valids - ', formValids);
    }
  }, [props.debug, formValids]);

  useEffect(() => {
    if (props?.debug?.errors) {
      console.log('form - errors - ', formErrors);
    }
  }, [props.debug, formErrors]);

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

    if (!output.success) {
      const issues = output?.error?.issues;
      const haveErrors = issues?.length > 0;
      let errors = {};

      if (haveErrors) {
        issues.forEach((issue: ZodIssueBase) => {
          if (touchedInputs[issue.path[0]]) {
            valids = { ...valids, [issue.path[0]]: false };
            errors = { ...errors, [issue.path[0]]: issue.message };
          }
        });
      }

      setFormErrors(errors);
    }

    setFormValids(valids);
    props.emitFormValid(Object.values(valids).every((item) => item));
  };

  return (
    <form>
      {Object.entries(props.scheme.inputs).map(([inputName, inputProps]) => {
        return (
          <InputComponent
            {...inputProps}
            key={inputName}
            valid={touchedInputs[inputName] ? formValids[inputName] : true}
            error={touchedInputs[inputName] ? formErrors[inputName] : null}
            value={formValues[inputName]}
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
    </form>
  );
}
