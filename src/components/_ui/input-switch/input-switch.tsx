import { cn } from '#/shared/utils/cn.util';
import { useEffect, useState, type InputHTMLAttributes } from 'react';

export interface InputSwitchProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'required' | 'name' | 'onKeyDown' | 'tabIndex'
  > {
  for: string;
  valid: boolean;
  label?: string;
  required?: boolean;
  touched?: boolean;
  error?: string | null;
  className?: string;
  type?: 'switch';
  icon?: React.ReactNode;
  showLabel: true;
  value: boolean;
  checkedLabel: string;
  uncheckedLabel: string;
  variant: 'vertical' | 'vertical-reversed';
  onChange?: (value: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function InputSwitch({
  for: forProp,
  valid,
  label,
  required,
  value,
  checkedLabel,
  uncheckedLabel,
  showLabel,
  icon,
  touched = false,
  error = null,
  className = '',
  type = 'switch',
  variant = 'vertical',
  onChange,
  onBlur,
  onFocus,
  ...props
}: InputSwitchProps) {
  const [inputValue, setinputValue] = useState<boolean>(false);

  useEffect(() => {
    setinputValue(value);
  }, [value]);

  const handleOnChange = () => {
    setinputValue((prev) => !prev);
    if (onChange) {
      onChange(!inputValue);
    }
  };

  const handleFocus = () => {
    window.umami.track('Focus input', { name: props.name });
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    window.umami.track('Blur input', { name: props.name });
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <label
      className={`group relative flex w-full max-w-md flex-col ${label ? 'pt-2' : ''} ${className ?? ''}`}
      htmlFor={forProp}
      aria-labelledby={type}
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
          'flex h-10 w-full items-center gap-4 rounded-md border border-gray-300 p-2 px-4 transition-shadow   dark:border-slate-800',
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
          type='checkbox'
          className='peer sr-only'
          checked={inputValue}
          onChange={handleOnChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <div
          className={cn([
            'relative h-6 w-10 rounded-full bg-gray-200 peer-focus:ring peer-focus:ring-green-400/50 dark:bg-slate-950',
          ])}
        >
          <div
            className={cn([
              'absolute start-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-gray-50 transition content-[""] dark:bg-slate-700',
              inputValue &&
                'translate-x-[16px] border-white bg-green-500 dark:bg-green-500',
            ])}
          ></div>
        </div>
        {showLabel && (
          <span
            className={cn([
              'text-sm text-gray-600 dark:text-slate-200',
              inputValue && 'text-green-500 dark:text-green-500',
              variant === 'vertical' && 'ml-3',
              variant === 'vertical-reversed' && 'mr-3',
            ])}
          >
            {inputValue ? checkedLabel : uncheckedLabel}
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
