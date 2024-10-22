'use client';

import { cn } from '#/shared/utils/cn.util';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

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
  touched?: boolean;
  value: string;
  icon?: React.ReactNode;
}

function Input({
  for: forProp,
  valid,
  label,
  required,
  touched = false,
  error = null,
  className = '',
  icon,
  ...props
}: InputComponentProps) {
  return (
    <label
      className={`group relative flex w-full max-w-md flex-col ${label ? 'pt-2' : ''} ${className ?? ''}`}
      htmlFor={forProp}
    >
      {label && (
        <span
          className={cn([
            touched && !valid ? '!text-red-400' : '',
            touched && valid ? '!text-green-400' : '',
            'w-auto pb-2 pl-2 text-sm text-gray-400',
          ])}
        >
          {`${label}${required ? '*' : ''}`}
        </span>
      )}

      <span
        className={cn([
          'flex h-10 w-full items-center gap-4 rounded-md border border-gray-200 bg-gray-100 p-2 px-4 dark:border-slate-800/40 dark:bg-slate-900',
          touched && !valid ? '!border-red-400' : '',
          touched && valid ? '!border-green-400' : '',
        ])}
      >
        {icon && (
          <span className='text-gray-500 dark:text-gray-500'>{icon}</span>
        )}

        <input
          {...props}
          className={cn([
            label
              ? 'placeholder:text-gray-400 dark:placeholder:text-slate-700'
              : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'peer w-full bg-gray-100 text-sm text-gray-800',
            ' text-inherit outline-none transition-all dark:bg-slate-900 dark:text-slate-200 ',
          ])}
        />
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
