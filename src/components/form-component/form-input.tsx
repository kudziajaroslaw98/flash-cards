'use client';

import isDropdown from '#/shared/guards/is-dropdown';
import isInput from '#/shared/guards/is-input';
import isTextArea from '#/shared/guards/is-text-area';
import type {
  ExtendedInputType,
  InputType,
  InternalConstraint,
} from '#/types/form-scheme.type';
import * as m from 'framer-motion/m';
import type { FormEvent } from 'react';
import Dropdown from '../_ui/dropdown/dropdown';
import Input from '../_ui/input/input';
import TextArea from '../_ui/text-area/text-area';

type FormInputProps<T> = {
  inputName: string;
  anyTouched: boolean;
  index: number;
  value: unknown;
  valid: boolean;
  error: string | null;
  touched: boolean;
  handleOnInput: (
    e: FormEvent<HTMLInputElement> | FormEvent<HTMLTextAreaElement>,
    key: string,
  ) => void;
  handleOnChange: (value: unknown | unknown[], key: string) => void;
  handleOnFocus: (key: string) => void;
  handleOnBlur: () => void;
  inputProps: ExtendedInputType<InputType, T>;
  constaintProps: InternalConstraint<T>[];
};

export default function FormInput<T>({
  inputName,
  index,
  value,
  valid,
  error,
  touched,
  handleOnInput,
  handleOnFocus,
  handleOnChange,
  handleOnBlur,
  inputProps,
  ...props
}: FormInputProps<T>) {
  const constaintProps = props.constaintProps
    ?.filter((item) => item.type === 'prop')
    .reduceRight(
      (acc, item) => ({
        ...acc,
        [item.propName]: item.propValue,
      }),
      {},
    ) as Record<string, unknown>;

  return (
    <m.div
      key={`${inputName}-${index}`}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {isTextArea(inputProps) && (
        <TextArea
          {...inputProps}
          key={`${inputName}-${index}`}
          value={value as string}
          valid={touched ? valid : true}
          error={touched ? error : null}
          touched={touched}
          onInput={(e) => handleOnInput(e, inputName)}
          onFocus={() => handleOnFocus(inputName)}
          onBlur={handleOnBlur}
          {...constaintProps}
        ></TextArea>
      )}

      {isDropdown(inputProps) && (
        <Dropdown
          {...inputProps}
          key={`${inputName}-${index}`}
          value={value}
          valid={touched ? valid : true}
          error={touched ? error : null}
          touched={touched}
          onChange={(e) => handleOnChange(e, inputName)}
          onFocus={() => handleOnFocus(inputName)}
          onBlur={handleOnBlur}
          {...constaintProps}
        ></Dropdown>
      )}

      {isInput(inputProps) && (
        <Input
          {...inputProps}
          key={`${inputName}-${index}`}
          valid={touched ? valid : true}
          error={touched ? error : null}
          touched={touched}
          value={(value as string) ?? ''}
          onInput={(e) => handleOnInput(e, inputName)}
          onFocus={() => handleOnFocus(inputName)}
          onBlur={handleOnBlur}
          {...constaintProps}
        />
      )}
    </m.div>
  );
}
