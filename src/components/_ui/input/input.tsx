'use client';

import { cn } from '#/shared/utils/cn.util';
import type { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';

export type InputValidation =
  | {
      valid: false;
      error: string;
      details?: string;
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
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    window.umami.track('Focus input', { name: props.name });
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    window.umami.track('Blur input', { name: props.name });
    if (props.onBlur) props.onBlur(e);
  };

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
          {`${label}${required ? ' *' : ' (optional)'}`}
        </span>
      )}

      <span
        className={cn([
          'flex h-10 w-full items-center gap-4 rounded-md border border-gray-300  p-2 px-4 transition-shadow has-[:focus]:ring  dark:border-slate-800',
          touched && !valid
            ? '!border-red-400 has-[:focus]:ring-red-400/50'
            : '',
          touched && valid
            ? '!border-green-400 has-[:focus]:ring-green-400/50'
            : '',
        ])}
      >
        {icon && (
          <span className='text-gray-500 dark:text-gray-500'>{icon}</span>
        )}

        <input
          {...props}
          type={type}
          tabIndex={props.tabIndex ?? 0}
          className={cn([
            label
              ? 'placeholder:text-gray-400 dark:placeholder:text-slate-700'
              : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'peer w-full text-sm text-gray-800',
            'bg-transparent text-inherit outline-none transition-all dark:text-slate-200',
          ])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={touched && !valid ? 'true' : 'false'}
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
