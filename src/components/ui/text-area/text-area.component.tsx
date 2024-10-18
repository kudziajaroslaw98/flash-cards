import useDebounce from '#/hooks/use-debounce.hook';
import { cn } from '#/shared/utils/cn.util';
import {
  FormEvent,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className: string;
  valid: boolean;
  for?: string;
  label?: string;
  touched?: boolean;
  error?: string | null;
}

export default function TextArea({
  for: forProp,
  className,
  valid,
  label,
  required,
  touched = false,
  error = null,
  ...props
}: TextAreaProps) {
  const [value, setValue] = useState(props.value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useDebounce(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '36px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, 75);

  useEffect(() => {
    adjustHeight();

    window.addEventListener('resize', () => {
      adjustHeight();
    });

    return () => {
      window.removeEventListener('resize', () => {
        adjustHeight();
      });
    };
  }, [adjustHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleOnInput = (event: FormEvent<HTMLTextAreaElement>) => {
    setValue(event.currentTarget.value);

    if (props.onInput) {
      props.onInput(event);
    }
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
            'w-auto pb-2 pl-2 text-gray-400 dark:text-slate-500',
          ])}
        >
          {`${label}${required ? '*' : ''}`}
        </span>
      )}
      <textarea
        {...props}
        ref={textAreaRef}
        className={cn([
          touched && !valid ? '!border-red-400' : '',
          touched && valid ? '!border-green-400' : '',
          'flex w-full items-center gap-4 rounded-md border border-gray-300 bg-gray-100 p-2 px-4 dark:border-slate-800 dark:bg-slate-900',
          'resize-nonep-2 h-10 outline-none ring-blue-400 transition-all focus:ring-1',
          label
            ? 'placeholder:text-gray-300  dark:placeholder:text-slate-700'
            : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'text-gray-800 text-inherit dark:text-slate-200',
          className,
        ])}
        id={props.id}
        value={value}
        onInput={handleOnInput}
      ></textarea>

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
