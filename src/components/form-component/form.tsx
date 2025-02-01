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
  useImperativeHandle,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type Ref,
  type SetStateAction,
} from 'react';
import {
  type SafeParseError,
  type SafeParseSuccess,
  type ZodIssueBase,
} from 'zod';
import FormInputsComponent from './form-inputs';

export type FormProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: Ref<FormMethods<T>>;
  scheme: FormScheme<T>;
  initialValues?: T;
  emitFormValid?:
    | Dispatch<SetStateAction<boolean>>
    | ((value: boolean) => void);
  emitFormValue?:
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
};

export interface FormMethods<T> {
  checkValidity: () => Promise<void>;
  isValid: () => boolean;
  value: T;
}

export default function FormComponent<T>({ ref, ...props }: FormProps<T>) {
  //////////////
  // #region STATE
  //////////////

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
  const [formValidity, setFormValidity] = useState<boolean>(true);
  const [touchedInputs, setTouchedInputs] = useState<Record<string, boolean>>(
    {},
  );
  const initialValuesRef = useRef<T | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    checkValidity: () => checkFormValidityOnSubmit(),
    isValid: () => getFormValidity(),
    value: formValues as T,
  }));

  //////////////
  // #endregion
  //////////////

  //////////////
  // #region FORM CONSTRUCT
  //////////////

  useEffect(() => {
    if (
      initialValuesRef.current === null ||
      isDifferent(initialValuesRef.current, props.initialValues)
    ) {
      let initialInputs: string[] = [];
      let initialValids: Record<string, boolean> = {};
      let initialErrors: Record<string, string | null> = {};
      let tmpValues: Record<string, string | unknown[]> = {};
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

        const inputDefaultInitialValue = Array.isArray(
          // @ts-expect-error Generic type generate error here
          props.initialValues?.[inputName],
        )
          ? []
          : '';

        tmpValues = {
          ...tmpValues,
          // @ts-expect-error Generic type generate error here
          [inputName]: props.initialValues?.[inputName]
            ? // @ts-expect-error  Generic type generate error here
              props.initialValues?.[inputName]
            : inputDefaultInitialValue,
        };
      });

      const initialValues: Record<keyof T, string | unknown[]> = {
        ...props.initialValues,
        ...tmpValues,
      } as Record<keyof T, unknown[]>;

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
              !constraint.safeParse(formValues?.[key as string]).success,
          );

          if (isInvalid) {
            initialVisibility = { ...initialVisibility, [inputName]: false };
          }
        }
      }
    });

    setInputsVisibility(initialVisibility);
    setInputValidations(initialValidations);
  }, [formValues]);

  //////////////
  // #endregion
  //////////////

  //////////////
  // #region DEBUG LOG
  //////////////

  useEffect(() => {
    if (props?.debug?.inputs) {
      console.log('form - inputs - ', formInputs);
    }
  }, [props.debug, formInputs]);

  useEffect(() => {
    if (props?.debug?.validity) {
      console.warn('form - valids - ', inputsValidity);
    }
  }, [props.debug, inputsValidity]);

  useEffect(() => {
    if (props?.debug?.errors) {
      console.warn('form - errors - ', inputsErrors);
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
  // #endregion
  //////////////

  //////////////
  // #region VALIDATION
  //////////////

  const checkFormValidity = async (
    newTouched?: Record<string, boolean>,
  ): Promise<void> => {
    const checking: Promise<void> = new Promise((resolve) => {
      const inputs = Object.keys(props.scheme.inputs);
      let valids = defaultValids;
      let errors = {};
      let formValid = true;

      inputs.forEach((inputName) => {
        const dependentValidations = inputValidations[inputName].filter(
          (validation) => {
            return (
              validation.whenConstraint &&
              validation.whenKey &&
              validation.whenConstraint.safeParse(
                formValues[validation.whenKey as string],
              ).success
            );
          },
        );
        const independentValidations = inputValidations[inputName].filter(
          (validation) => !validation.whenConstraint || !validation.whenKey,
        );

        const dependentOutputs: (
          | SafeParseSuccess<unknown>
          | SafeParseError<unknown>
        )[] = dependentValidations.map((validation) => {
          return validation.constraint.safeParse(
            formValues[validation.key as string],
          );
        });

        const independentOutputs: (
          | SafeParseSuccess<unknown>
          | SafeParseError<unknown>
        )[] = independentValidations.map((validation) => {
          return validation.constraint.safeParse(
            formValues[validation.key as string],
          );
        });

        if (newTouched ?? touchedInputs[inputName]) {
          [...dependentOutputs, ...independentOutputs].forEach((output) => {
            if (!output.success) {
              formValid = false;
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
        setTouchedInputs(newTouched ?? touchedInputs);

        if (props.emitFormValid) {
          props.emitFormValid(Object.values(valids).every((item) => item));
        }
      });

      setFormValidity(formValid);

      for (const [key, value] of Object.entries(valids)) {
        if (!value) {
          const firstInvalidElement = formRef.current?.querySelector(
            `[name="${key}"]`,
          ) as HTMLElement;
          firstInvalidElement?.focus();
          break;
        }
      }

      resolve();
    });

    return await checking;
  };

  const checkFormValidityOnSubmit = async () => {
    const inputs = Object.keys(props.scheme.inputs);
    let touchedTmp = {};

    inputs.forEach((inputName) => {
      touchedTmp = { ...touchedTmp, [inputName]: true };
    });

    await checkFormValidity(touchedTmp);
  };

  const getFormValidity = () => {
    return formValidity;
  };

  //////////////
  // #endregion
  //////////////

  //////////////
  // #region HANDLERS
  //////////////

  const handleOnInput = (
    event: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    inputName: string,
  ) => {
    if (props.emitFormValue) {
      props.emitFormValue({
        ...formValues,
        [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
          ?.value,
      } as T);
    }

    setFormValues((prev) => ({
      ...prev,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    }));
  };

  const handleOnChange = (value: unknown | unknown[], inputName: string) => {
    if (props.emitFormValue) {
      props.emitFormValue({
        ...formValues,
        [inputName]: value,
      } as T);
    }

    setFormValues((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const handleOnBlur = async () => {
    await checkFormValidity();
  };

  const handleOnFocus = (inputName: string) => {
    setTouchedInputs((prev) => ({ ...prev, [inputName]: true }));
  };

  //////////////
  // #endregion
  //////////////

  return (
    <form
      className={cn([
        'h-full overflow-x-visible overflow-y-scroll p-4',
        props.className,
      ])}
      ref={formRef}
    >
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
