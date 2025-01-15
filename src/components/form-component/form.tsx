'use client';

import { cn } from '#/shared/utils/cn.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import {
  FormScheme,
  type ExtendedInputType,
  type InputType,
  type InputValidation,
} from '#/types//form-scheme.type';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import {
  type SafeParseError,
  type SafeParseSuccess,
  type ZodIssueBase,
} from 'zod';
import FormInputsComponent from './form-inputs';

export default function FormComponent<T>(props: {
  scheme: FormScheme<T>;
  initialValues?: T;
  emitFormValid?:
    | Dispatch<SetStateAction<boolean>>
    | ((value: boolean) => void);
  emitFormValue:
    | Dispatch<SetStateAction<Partial<T>>>
    | ((value: Partial<T>) => void);
  className?: string;
  formValid?: boolean;
  formError?: string;
  debug?: {
    inputs?: boolean;
    validity?: boolean;
    errors?: boolean;
    values?: boolean;
    touch?: boolean;
    visibility?: boolean;
  };
}) {
  const [inputsValidity, setInputsValidity] = useState<Record<string, boolean>>(
    {},
  );
  const [inputsVisibility, setInputsVisibility] = useState<
    Record<string, boolean>
  >({});
  const [inputsErrors, setInputsErrors] = useState<
    Record<string, string | null>
  >({});
  const [inputValidations, setInputValidations] = useState<
    Record<string, InputValidation<T>[]>
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
      let initialVisibility: Record<string, boolean> = {};
      let initialValidations: Record<string, InputValidation<T>[]> = {};

      const inputs = Object.entries(props.scheme.inputs) as [
        string,
        ExtendedInputType<InputType, T>,
      ][];

      inputs.forEach(([inputName, input]) => {
        initialVisibility = { ...initialVisibility, [inputName]: true };
        initialValidations = { ...initialValidations, [inputName]: [] };

        if (input?._internal_constraints) {
          const showConstraints = input._internal_constraints.filter(
            ({ type }) => type === 'show',
          );
          const validationConstraints = input._internal_constraints.filter(
            ({ type }) => type === 'validation',
          );

          initialValidations = {
            ...initialValidations,
            [inputName]: validationConstraints,
          };

          if (showConstraints.length > 0) {
            const isInvalid = showConstraints.some(
              ({ key, constraint }) =>
                !constraint.safeParse(
                  props.initialValues?.[key] ?? formValues?.[key as string],
                ).success,
            );

            if (isInvalid) {
              initialVisibility = { ...initialVisibility, [inputName]: false };
            }
          }
        }

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
      setInputsVisibility(initialVisibility);
      setInputValidations(initialValidations);
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

  //////////////
  // debug log
  //////////////

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

  useEffect(() => {
    if (props?.debug?.visibility) {
      console.log('form - visibility - ', inputsVisibility);
    }
  }, [props.debug, inputsVisibility]);

  //////////////
  //////////////
  //////////////

  const checkFormValidity = () => {
    const inputs = Object.keys(props.scheme.inputs);
    let valids = defaultValids;
    let errors = {};

    inputs.forEach((inputName) => {
      const validations = inputValidations[inputName].filter((validation) => {
        return (
          validation.whenConstraint &&
          validation.whenKey &&
          validation.whenConstraint.safeParse(
            formValues[validation.whenKey as string],
          ).success
        );
      });

      const outputs: (SafeParseSuccess<unknown> | SafeParseError<unknown>)[] =
        validations.map((validation) => {
          return validation.constraint.safeParse(
            formValues[validation.key as string],
          );
        });

      if (touchedInputs[inputName]) {
        outputs.forEach((output) => {
          if (!output.success) {
            console.log(output);
            const issues = output?.error?.issues;
            const haveErrors = issues?.length > 0;

            if (haveErrors) {
              issues.forEach((issue: ZodIssueBase) => {
                valids = { ...valids, [inputName]: false };
                errors = { ...errors, [inputName]: issue.message };
              });
            }
          }
        });
      }

      setInputsErrors(errors);
      setInputsValidity(valids);

      if (props.emitFormValid) {
        props.emitFormValid(Object.values(valids).every((item) => item));
      }
    });
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
    <form className={cn([props.className])}>
      <FormInputsComponent<T>
        inputs={props.scheme.inputs}
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
