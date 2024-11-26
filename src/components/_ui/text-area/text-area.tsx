import {
  FormEvent,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import useDebounce from '#/hooks/use-debounce.hook';
import { cn } from '#/shared/utils/cn.util';
import { Button } from '../button/button';

export type TextAreaProps = {
  type?: 'textarea';
  className: string;
  valid: boolean;
  for?: string;
  label?: string;
  touched?: boolean;
  error?: string | null;
  handleGenerate?: () => void;
} & Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'value'
  | 'onChange'
  | 'onInput'
  | 'required'
  | 'onBlur'
  | 'onFocus'
  | 'id'
  | 'name'
  | 'tabIndex'
>;

export default function TextArea({
  for: forProp,
  className,
  valid,
  label,
  required,
  touched = false,
  error = null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type = 'textarea',
  handleGenerate,
  ...props
}: TextAreaProps) {
  const [value, setValue] = useState(props.value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useDebounce(() => {
    if (textAreaRef.current) {
      const minHeight = 40;

      textAreaRef.current.style.height = '40px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight >= minHeight ? textAreaRef.current.scrollHeight : minHeight}px`;
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

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleOnInput = (event: FormEvent<HTMLTextAreaElement>) => {
    setValue(event.currentTarget.value);

    if (props.onInput) {
      props.onInput(event);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    window.umami.track('Focus input', { name: props.name });
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    window.umami.track('Blur input', { name: props.name });
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const generate = () => {
    window.umami.track('Generate text clicked', { name: props.name });
    if (handleGenerate) {
      handleGenerate();
    }
  };

  return (
    <label
      className={`group relative flex w-full flex-col ${label ? 'pt-2' : ''} ${className ?? ''}`}
      htmlFor={forProp}
    >
      {label && (
        <span
          className={cn([
            touched && !valid ? '!text-red-400' : '',
            touched && valid ? '!text-green-400' : '',
            'w-auto pb-2 pl-2 text-sm  text-gray-400 dark:text-slate-500',
          ])}
        >
          {`${label}${required ? '*' : ''}`}
        </span>
      )}
      <span className='relative'>
        <textarea
          {...props}
          ref={textAreaRef}
          className={cn([
            touched && !valid ? '!border-red-400' : '',
            touched && valid ? '!border-green-400' : '',
            'relative flex w-full items-center gap-4 rounded-md border border-gray-200 bg-gray-100 p-2 px-4 dark:border-slate-800/40 dark:bg-slate-900',
            'h-10 resize-none text-sm outline-none ring-green-400/50 transition-all focus:ring',
            label
              ? 'placeholder:text-gray-400  dark:placeholder:text-slate-700'
              : 'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'text-gray-800 text-inherit dark:text-slate-200',
            className,
          ])}
          tabIndex={props.tabIndex ?? 0}
          id={props.id}
          value={value}
          onInput={handleOnInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        ></textarea>

        {handleGenerate && (
          <Button
            type='button'
            variant={'secondary'}
            size={'icon-xs'}
            className='absolute right-[10px] top-[10px] z-40'
            onClick={generate}
            icon={<SparklesIcon className='size-3' />}
          />
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
