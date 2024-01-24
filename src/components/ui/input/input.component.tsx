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
  validate?: (value: T) => boolean;
}

function InputComponent<T>(props: InputProps<T>) {
  const [valid, setValid] = useState(true);

  const validate = (value: T) => {
    props.validate && setValid(props.validate(value));
  };

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col pt-6`}
      htmlFor={props.for}
    >
      <input
        {...omit(props, ['for', 'label', 'validate'])}
        onBlur={(e) => validate(e.currentTarget.value as T)}
        className={`${
          !valid ? '!border-red-400' : ''
        } peer w-full rounded-md border border-green-400 bg-gray-100 p-2 px-6 outline-none transition-all placeholder:text-gray-100 focus:placeholder:text-gray-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-900 dark:focus:placeholder:text-slate-400`}
      />

      {props.label && (
        <span
          className={`${
            props.value && props.value !== ''
              ? '-translate-y-8'
              : '-translate-y-0'
          } 
          ${!valid ? '!text-red-400' : ''}
          absolute left-2 top-8 z-20 w-auto px-4 text-green-400 
          transition after:absolute after:left-0 after:-z-10 after:h-1 after:w-full after:translate-y-6 after:bg-gray-100
          group-hover:-translate-y-8 group-active:-translate-y-8 peer-focus:-translate-y-8
          dark:after:bg-slate-900`}
        >
          {props.label}
        </span>
      )}
    </label>
  );
}

export default InputComponent;
