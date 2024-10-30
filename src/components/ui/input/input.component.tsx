'use client';

import { cn } from '#/shared/utils/cn.util';
import type { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';

export type InputValidation =
  | {
      valid: false;
      error: string;
    }
  | {
      valid: true;
    };

export interface InputComponentProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'className'
    | 'required'
    | 'placeholder'
    | 'value'
    | 'name'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onInput'
    | 'onKeyDown'
    | 'tabIndex'
  > {
  type: HTMLInputTypeAttribute;
  label?: string;
  for?: string;
  valid: boolean;
  error?: string | null;
  touched?: boolean;
  icon?: React.ReactNode;
  value?: string;
}

function Input({
  for: forProp,
  valid,
  label,
  required,
  touched = false,
  error = null,
  className = '',
  type = 'text',
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
          type={type}
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
