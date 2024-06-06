'use client';

import { cn } from '#/shared/utils/cn.util';
import { DetailedHTMLProps, InputHTMLAttributes, useRef } from 'react';

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
  error?: string | null;
  value: string;
  icon?: React.ReactNode;
}

function Input({
  for: forProp,
  valid,
  value,
  label,
  required,
  error = null,
  className = '',
  icon,
  ...props
}: InputComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col ${label ? 'pt-6' : ''} ${className}`}
      htmlFor={forProp}
      onClick={handleClick}
    >
      <span
        className={`flex w-full items-center gap-4 rounded-md border border-gray-300 bg-gray-100 p-2 px-4 dark:border-slate-800 dark:bg-slate-900 ${!valid ? '!border-red-400' : ''}`}
      >
        {icon && (
          <span className='text-gray-500 dark:text-gray-500'>{icon}</span>
        )}
        {/* focus:placeholder:text-gray-600 dark:placeholder:text-slate-900 dark:focus:placeholder:text-slate-400 placeholder:text-gray-100*/}

        <input
          {...props}
          ref={inputRef}
          className={cn([
            !valid ? '!border-red-400' : '',
            label
              ? 'placeholder:text-gray-100 focus:placeholder:text-gray-600 dark:placeholder:text-slate-900 dark:focus:placeholder:text-slate-400'
              : 'placeholder:text-gray-500 dark:placeholder:text-gray-500',
            'peer w-full bg-gray-100 text-gray-800',
            ' text-inherit outline-none transition-all dark:bg-slate-900 dark:text-slate-200 ',
          ])}
        />

        {label && (
          <span
            className={`${
              value && value !== '' ? '-translate-y-8' : '-translate-y-0'
            } 
          ${!valid ? '!text-red-400' : ''}
          absolute left-2 top-8 z-20 w-auto px-4 text-green-400 
          transition after:absolute after:left-0 after:-z-10 after:h-1 after:w-full after:translate-y-6 after:bg-gray-100
          group-hover:-translate-y-8 group-active:-translate-y-8 peer-focus:-translate-y-8
          dark:after:bg-slate-900`}
          >
            {`${label}${required ? '*' : ''}`}
          </span>
        )}
      </span>

      <span
        className={`${
          error ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        } px-6 text-sm text-red-400 transition-all duration-700 ease-in-out`}
      >
        {error}
      </span>
    </label>
  );
}

export default Input;
