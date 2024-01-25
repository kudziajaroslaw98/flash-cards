'use client';

import { omit } from 'lodash';
import { DetailedHTMLProps, InputHTMLAttributes, useState } from 'react';

interface InputProps<T>
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  for?: string;
  validate?: (value: T) => InputValidation;
}

export interface InputValidation {
  valid: boolean;
  error?: string;
}

function InputComponent<T>(props: InputProps<T>) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string>();

  const validate = (value: T) => {
    if (props.validate) {
      const { valid, error } = props.validate(value);

      setIsValid(valid);
      setError(error);
    }
  };

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col pt-6`}
      htmlFor={props.for}
    >
      <input
        {...omit(props, ['for', 'label', 'validate'])}
        onBlur={(e) => validate(e.currentTarget.value as T)}
        className={`${!isValid ? '!border-red-400' : ''} 
        peer w-full rounded-md border border-green-400 bg-gray-100 p-2 px-6 text-base text-gray-800 outline-none transition-all placeholder:text-gray-100
        focus:placeholder:text-gray-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-900 dark:focus:placeholder:text-slate-400
        `}
      />

      {props.label && (
        <span
          className={`${
            props.value && props.value !== ''
              ? '-translate-y-8'
              : '-translate-y-0'
          } 
          ${!isValid ? '!text-red-400' : ''}
          absolute left-2 top-8 z-20 w-auto px-4 text-green-400 
          transition after:absolute after:left-0 after:-z-10 after:h-1 after:w-full after:translate-y-6 after:bg-gray-100
          group-hover:-translate-y-8 group-active:-translate-y-8 peer-focus:-translate-y-8
          dark:after:bg-slate-900`}
        >
          {props.label}
        </span>
      )}

      <span
        className={`${
          error ? 'h-4 opacity-100' : 'h-0 opacity-0'
        } px-6 text-red-400 transition-all`}
      >
        {error}
      </span>
    </label>
  );
}

export default InputComponent;
