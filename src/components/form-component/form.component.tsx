'use client';

import Input, {
  type InputComponentProps,
} from '#/components/ui/input/input.component';
import isTextArea from '#/shared/guards/is-text-area.guard';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FocusEvent,
  type FormEvent,
  type SetStateAction,
} from 'react';
import type {
  SafeParseError,
  SafeParseSuccess,
  ZodEffects,
  ZodIssueBase,
  ZodObject,
  ZodTypeAny,
} from 'zod';
import TextArea, {
  type TextAreaProps,
} from '../ui/text-area/text-area.component';

type ZodSchemaFromBaseObject<T> =
  | ZodObject<Record<keyof T, ZodTypeAny>>
  | ZodEffects<ZodObject<Record<keyof T, ZodTypeAny>>>;

type FormScheme<T> = {
  validation: ZodSchemaFromBaseObject<T>;
  inputs: T;
};

export default function FormComponent<
  T extends
    | Record<string, Omit<InputComponentProps, 'value' | 'error' | 'valid'>>
    | Record<string, TextAreaProps>,
>(props: {
  scheme: FormScheme<T>;
  initialValues?: Partial<Record<keyof T, string>>;
  emitFormValid: Dispatch<SetStateAction<boolean>>;
  emitFormValue: Dispatch<SetStateAction<Partial<Record<keyof T, string>>>>;
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

  const handleOnInput = (
    event: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    inputName: string,
    inputProps:
      | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
      | TextAreaProps,
  ) => {
    if (inputProps.onInput) {
      inputProps.onInput(
        event as FormEvent<HTMLInputElement> & FormEvent<HTMLTextAreaElement>,
      );
    }

    props.emitFormValue({
      ...formValues,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    } as Partial<Record<keyof T, string>>);

    setFormValues((prev) => ({
      ...prev,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    }));
  };

  const handleOnBlur = (
    event:
      | FocusEvent<HTMLTextAreaElement, Element>
      | FocusEvent<HTMLInputElement, Element>,
    inputProps:
      | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
      | TextAreaProps,
  ) => {
    if (inputProps.onBlur) {
      inputProps.onBlur(
        event as FocusEvent<HTMLTextAreaElement, Element> &
          FocusEvent<HTMLInputElement, Element>,
      );
    }

    checkFormValidity();
  };

  const handleOnFocus = (
    event:
      | FocusEvent<HTMLTextAreaElement, Element>
      | FocusEvent<HTMLInputElement, Element>,
    inputName: string,
    inputProps:
      | Omit<InputComponentProps, 'value' | 'error' | 'valid'>
      | TextAreaProps,
  ) => {
    if (inputProps.onFocus) {
      inputProps.onFocus(
        event as FocusEvent<HTMLTextAreaElement, Element> &
          FocusEvent<HTMLInputElement, Element>,
      );
    }

    setTouchedInputs((prev) => ({ ...prev, [inputName]: true }));
  };

  return (
    <form className={props.className}>
      {Object.entries(props.scheme.inputs).map(([inputName, inputProps]) => {
        return (
          <span key={inputName}>
            {isTextArea(inputProps) && (
              <TextArea
                {...inputProps}
                key={inputName}
                value={formValues[inputName] ?? ''}
                valid={
                  touchedInputs[inputName] ? inputsValidity[inputName] : true
                }
                error={
                  touchedInputs[inputName] ? inputsErrors[inputName] : null
                }
                touched={touchedInputs[inputName]}
                onInput={(e) => handleOnInput(e, inputName, inputProps)}
                onFocus={(e) => handleOnFocus(e, inputName, inputProps)}
                onBlur={(e) => handleOnBlur(e, inputProps)}
              ></TextArea>
            )}

            {!isTextArea(inputProps) && (
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
                value={formValues[inputName] ?? ''}
                onInput={(e) => handleOnInput(e, inputName, inputProps)}
                onFocus={(e) => handleOnFocus(e, inputName, inputProps)}
                onBlur={(e) => handleOnBlur(e, inputProps)}
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
