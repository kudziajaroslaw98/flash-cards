'use client';

import { isInternalInput } from '#/shared/guards/is-internal-input';
import { cn } from '#/shared/utils/cn.util';
import { isDifferent } from '#/shared/utils/is-different.util';
import type { ExtendedSchemeKeys } from '#/types/extended-scheme-keys.type';
import type {
  ExtendedInputType,
  FormScheme,
  InputType,
} from '#/types/form-scheme.type';
import type { InternalAccordion } from '#/types/input-types';
import type { InputValidation } from '#/types/input-validation.type';
import {
  ChangeEvent,
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
  checkValidity: () => Promise<boolean>;
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

  const initFromInputs = ({
    inputs,
    initInputs,
    Valids,
    Errors,
    Visibility,
    Validations,
    initTmpValues,
  }: {
    inputs: [ExtendedSchemeKeys<T>, ExtendedInputType<InputType<T>, T>][];
    initInputs: string[];
    Valids: Record<string, boolean>;
    Errors: Record<string, string | null>;
    Visibility: Record<string, boolean>;
    Validations: Partial<Record<string, InputValidation<T>[]>>;
    initTmpValues: Partial<Record<ExtendedSchemeKeys<T>, string | unknown[]>>;
  }) => {
    let initialInputs: string[] = initInputs;
    let initialValids: Record<string, boolean> = Valids;
    let initialErrors: Record<string, string | null> = Errors;
    let tmpValues: Partial<Record<ExtendedSchemeKeys<T>, string | unknown[]>> =
      initTmpValues;
    let initialVisibility: Record<string, boolean> = Visibility;
    let initialValidations: Partial<
      Record<ExtendedSchemeKeys<T>, InputValidation<T>[]>
    > = Validations;

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
          const isInvalid = showConstraints.some(({ key, constraint }) => {
            if (isInternalInput<T>(key)) {
              return !constraint.safeParse(
                formValues?.[key as string] ?? input._internal_default_value,
              ).success;
            } else {
              return !constraint.safeParse(
                // TODO: Try to fix it later
                // @ts-expect-error its fine, false positive type error
                props.initialValues?.[key] ?? formValues?.[key as string],
              ).success;
            }
          });

          if (isInvalid) {
            initialVisibility = { ...initialVisibility, [inputName]: false };
          }
        }
      }

      initialInputs = [...initialInputs, inputName as string];
      initialValids = { ...initialValids, [inputName]: true };
      initialErrors = { ...initialErrors, [inputName]: null };

      let inputDefaultInitialValue;

      if (!isInternalInput<T>(inputName)) {
        if (input?._internal_default_value !== undefined) {
          inputDefaultInitialValue = input._internal_default_value;
        } else {
          switch (typeof props.initialValues?.[inputName]) {
            case 'string':
              inputDefaultInitialValue = '';
              break;
            case 'number':
              inputDefaultInitialValue = 0;
              break;
            case 'boolean':
              inputDefaultInitialValue = false;
              break;
            default:
              if (Array.isArray(props.initialValues?.[inputName])) {
                inputDefaultInitialValue = [];
              } else {
                inputDefaultInitialValue = '';
              }
          }
        }

        tmpValues = {
          ...tmpValues,
          [inputName]: (props.initialValues?.[inputName] as string)
            ? props.initialValues?.[inputName]
            : inputDefaultInitialValue,
        };
      } else {
        inputDefaultInitialValue =
          formValues?.[inputName] ?? input._internal_default_value ?? null;

        tmpValues = {
          ...tmpValues,
          [inputName]: inputDefaultInitialValue,
        };
      }
    });

    return {
      initialInputs,
      initialValids,
      initialErrors,
      initialVisibility,
      initialValidations,
      tmpValues,
    };
  };

  const getAllInputs = () => {
    const inputs = Object.entries(props.scheme.inputs) as [
      ExtendedSchemeKeys<T>,
      ExtendedInputType<InputType<T>, T>,
    ][];
    const allInputs = inputs;

    inputs
      .filter(([inputName]) => inputName.startsWith('_internal_accordion'))
      .map(([_inputName, input]) =>
        allInputs.push(
          ...(Object.entries((input as InternalAccordion<T>).inputs) as [
            ExtendedSchemeKeys<T>,
            ExtendedInputType<InputType<T>, T>,
          ][]),
        ),
      );
    return allInputs;
  };

  useEffect(() => {
    if (
      initialValuesRef.current === null ||
      isDifferent(initialValuesRef.current, props.initialValues)
    ) {
      let initialInputs: string[] = [];
      let initialValids: Record<string, boolean> = {};
      let initialErrors: Record<string, string | null> = {};
      let tmpValues: Partial<
        Record<ExtendedSchemeKeys<T>, string | unknown[]>
      > = {};
      let initialVisibility: Record<string, boolean> = {};
      let initialValidations: Partial<
        Record<ExtendedSchemeKeys<T>, InputValidation<T>[]>
      > = {};

      const inputs = getAllInputs();

      const result = initFromInputs({
        inputs,
        initInputs: initialInputs,
        Valids: initialValids,
        Errors: initialErrors,
        Visibility: initialVisibility,
        Validations: initialValidations,
        initTmpValues: tmpValues,
      });

      initialInputs = { ...initialInputs, ...result.initialInputs };
      initialValids = { ...initialValids, ...result.initialValids };
      initialErrors = { ...initialErrors, ...result.initialErrors };
      initialVisibility = { ...initialVisibility, ...result.initialVisibility };
      initialValidations = {
        ...initialValidations,
        ...result.initialValidations,
      };

      tmpValues = { ...tmpValues, ...result.tmpValues };

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
      setInputValidations(
        initialValidations as Record<string, InputValidation<T>[]>,
      );
      initialValuesRef.current = props.initialValues ?? null;
    }
  }, [props.initialValues, props.scheme.inputs]);

  useEffect(() => {
    let initialVisibility: Record<string, boolean> = {};
    let initialValidations: Record<string, InputValidation<T>[]> = {};
    const inputs = getAllInputs();

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
      console.log('form - values - ', formValues, JSON.stringify(formValues));
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
    focusInvalid?: boolean,
  ): Promise<boolean> => {
    const checking: Promise<boolean> = new Promise((resolve) => {
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

        if (
          (newTouched ?? touchedInputs[inputName]) &&
          inputsVisibility[inputName]
        ) {
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
        } else {
          formValid = true;
          valids = { ...valids, [inputName]: true };
          errors = { ...errors, [inputName]: null };
        }
      });

      setInputsErrors(errors);
      setInputsValidity(valids);
      setTouchedInputs(newTouched ?? touchedInputs);
      setFormValidity(formValid);

      if (props.emitFormValid) {
        props.emitFormValid(Object.values(valids).every((item) => item));
      }

      if (focusInvalid) {
        for (const [key, value] of Object.entries(valids)) {
          if (!value) {
            const firstInvalidElement = formRef.current?.querySelector(
              `[name="${key}"]`,
            ) as HTMLElement;
            firstInvalidElement?.focus();
            break;
          }
        }
      }

      resolve(Object.values(valids).every((item) => item));
    });

    return await checking;
  };

  const checkFormValidityOnSubmit = async () => {
    const inputs = Object.keys(props.scheme.inputs);
    let touchedTmp = {};

    inputs.forEach((inputName) => {
      touchedTmp = { ...touchedTmp, [inputName]: true };
    });

    return await checkFormValidity(touchedTmp, true);
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

  const handleEmitValues = (formInternalValues: Record<string, unknown>) => {
    if (props.emitFormValue) {
      const correctValues = Object.entries(formInternalValues).filter(
        ([key, _value]) => !key.startsWith('_internal_'),
      );
      props.emitFormValue(Object.fromEntries(correctValues) as T);
    }
  };

  const handleOnInput = (
    event: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    inputName: string,
  ) => {
    if (props.emitFormValue) {
      handleEmitValues({
        ...formValues,
        [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
          ?.value,
      });
    }

    setFormValues((prev) => ({
      ...prev,
      [inputName]: (event.target as HTMLInputElement | HTMLTextAreaElement)
        ?.value,
    }));
  };

  const handleOnChange = (
    value: unknown | unknown[] | ChangeEvent<HTMLInputElement>,
    inputName: string,
  ) => {
    const field = props.scheme.inputs[inputName];
    let tmpValue = value;

    if (field && field.type === 'input') {
      const e = value as ChangeEvent<HTMLInputElement>;
      const files = e.target.files as FileList;
      tmpValue =
        field.inputType === 'file' && files?.length > 0
          ? files?.[0]
          : e.target.value;
    }

    if (props.emitFormValue) {
      handleEmitValues({
        ...formValues,
        [inputName]: tmpValue,
      });
    }

    setFormValues((prev) => ({
      ...prev,
      [inputName]: tmpValue,
    }));
  };

  const handleOnBlur = async (_inputName: string) => {
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
      onSubmit={(e) => {
        e.preventDefault();
      }}
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
