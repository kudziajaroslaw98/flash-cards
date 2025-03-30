'use client';

import { cn } from '#/shared/utils/cn.util';
import {
  useRef,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
} from 'react';
import { FieldLabel } from '../field-label/field-label';

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
  inputType: HTMLInputTypeAttribute;
  label?: string;
  inputLabel?: string;
  input?: string;
  for?: string;
  valid: boolean;
  error?: string | null;
  touched?: boolean;
  icon?: React.ReactNode;
  value?: string;
  checked?: boolean;
}

function Input({
  for: forProp,
  valid,
  label,
  inputLabel,
  required,
  touched = false,
  error = null,
  className = '',
  inputType = 'text',
  icon,
  ...props
}: InputComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    window?.umami?.track('Focus input', { name: props.name });
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    window?.umami?.track('Blur input', { name: props.name });
    if (props.onBlur) props.onBlur(e);
  };

  const handleClick = () => {
    window?.umami?.track('Click input', { name: props.name });
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col ${label ? 'pt-2' : ''} ${className ?? ''}`}
      htmlFor={forProp}
      onClick={handleClick}
    >
      {label && (
        <FieldLabel
          touched={touched}
          valid={valid}
          required={required ?? false}
          label={label}
        />
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
          ref={inputRef}
          type={inputType}
          tabIndex={props.tabIndex ?? 0}
          className={cn([
            label
              ? 'placeholder:text-gray-400 dark:placeholder:text-slate-500'
              : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'peer text-sm text-gray-800 ',
            'text-inherit outline-none transition-all dark:text-slate-200',
            // peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-red-600 checked:border-red-600
            inputType === 'checkbox'
              ? `pointer-events-none relative h-4 min-w-4 appearance-none rounded border border-gray-300 checked:border-green-500
              checked:bg-green-500 checked:after:absolute checked:after:left-0 checked:after:top-0 checked:after:z-10
              checked:after:flex checked:after:h-full checked:after:w-full checked:after:items-center checked:after:justify-center
              checked:after:text-white checked:after:content-["✓"] dark:border-slate-700 dark:checked:border-green-500 dark:checked:bg-green-500`
              : 'w-full bg-transparent ',
          ])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={touched && !valid ? 'true' : 'false'}
        />
        {inputLabel && (
          <span className='pointer-events-none flex w-full text-nowrap text-gray-500 dark:text-slate-400'>
            {inputLabel}
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
