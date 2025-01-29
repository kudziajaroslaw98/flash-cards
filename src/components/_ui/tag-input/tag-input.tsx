'use client';

import { cn } from '#/shared/utils/cn.util';
import { X } from 'lucide-react';
import { useRef, useState, type InputHTMLAttributes } from 'react';
import { Button } from '../button/button';

export type TagInputValidation =
  | {
      valid: false;
      error: string;
    }
  | {
      valid: true;
    };

export interface TagInputComponentProps
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
  type: 'tag';
  label?: string;
  for?: string;
  valid: boolean;
  error?: string | null;
  touched?: boolean;
  icon?: React.ReactNode;
  value?: string;
}

function TagInput({
  for: forProp,
  valid,
  label,
  required,
  touched = false,
  error = null,
  className = '',
  type = 'tag',
  icon,
  ...props
}: TagInputComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    window.umami.track('Focus input', { name: props.name });
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    window.umami.track('Blur input', { name: props.name });
    if (props.onBlur) props.onBlur(e);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (props.onChange) props.onChange(e);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(inputValue);
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && !inputValue) {
      const lastTag = tags[tags.length - 1];
      if (lastTag) {
        removeTag(tags.length - 1);
        setInputValue(lastTag);
      }
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
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

      <div className='flex flex-col gap-2'>
        <span
          className={cn([
            'flex h-10 w-full items-center gap-4 rounded-md border border-gray-300  p-2 px-4 transition-shadow has-[:focus]:ring  dark:border-slate-800',
            touched && !valid ? '!border-red-400 !ring-red-400/50' : '',
            touched && valid ? '!border-green-400 !ring-green-400/50' : '',
          ])}
        >
          {icon && (
            <span className='text-gray-500 dark:text-gray-500'>{icon}</span>
          )}
          <input
            ref={inputRef}
            {...props}
            type={type}
            tabIndex={props.tabIndex ?? 0}
            value={inputValue}
            className={cn([
              label
                ? 'placeholder:text-gray-400 dark:placeholder:text-slate-700'
                : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'peer w-auto text-sm text-gray-800',
              'bg-transparent text-inherit outline-none transition-all dark:text-slate-200',
            ])}
            onChange={handleOnChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={touched && !valid ? 'true' : 'false'}
          />
        </span>

        <div className='inline-flex flex-wrap gap-2'>
          {tags.map((tag, index) => (
            <div
              key={index}
              className='flex items-center gap-1 rounded-md border border-green-300 bg-green-100/25 py-1 pl-3 pr-1 text-xs font-semibold text-green-600 transition-colors hover:bg-green-200 dark:border-green-950 dark:bg-green-950/25 dark:text-green-400'
            >
              <span className='flex h-full items-center justify-center'>
                {tag}
              </span>
              <Button
                onClick={() => removeTag(index)}
                size={'icon-xs'}
                icon={<X className='h-3 w-3' />}
                iconPosition='right'
                alt='Remove tag'
                variant={'primary-text'}
              />
            </div>
          ))}
        </div>
      </div>

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

export default TagInput;
