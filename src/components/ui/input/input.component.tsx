'use client';

import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useState,
} from 'react';

export type InputValidation =
  | {
      valid: false;
      error: string;
    }
  | {
      valid: true;
    };

interface NarrowedInputHTMLAttributes<T> extends InputHTMLAttributes<T> {
  value: string;
}

export interface InputComponentProps
  extends DetailedHTMLProps<
    NarrowedInputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  for?: string;
  valid: boolean;
  error: string | null;
  value: string;
}

function InputComponent(props: InputComponentProps) {
  const [inputProps, setInputProps] = useState<Partial<InputComponentProps>>({
    value: '',
    onChange: () => {},
  });

  useEffect(() => {
    const copiedProps: Partial<InputComponentProps> = { ...props };

    delete copiedProps.label;
    delete copiedProps.valid;
    delete copiedProps.for;
    delete copiedProps.error;

    setInputProps(copiedProps);
  }, [props]);

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col pt-6`}
      htmlFor={props.for}
    >
      <input
        {...inputProps}
        className={`${!props.valid ? '!border-red-400' : ''} 
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
          ${!props.valid ? '!text-red-400' : ''}
          absolute left-2 top-8 z-20 w-auto px-4 text-green-400 
          transition after:absolute after:left-0 after:-z-10 after:h-1 after:w-full after:translate-y-6 after:bg-gray-100
          group-hover:-translate-y-8 group-active:-translate-y-8 peer-focus:-translate-y-8
          dark:after:bg-slate-900`}
        >
          {`${props.label}${props.required ? '*' : ''}`}
        </span>
      )}

      <span
        className={`${
          props.error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        } px-6 text-sm text-red-400 transition-all duration-700 ease-in-out`}
      >
        {props.error}
      </span>
    </label>
  );
}

export default InputComponent;
