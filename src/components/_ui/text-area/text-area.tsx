import { cn } from '#/shared/utils/cn.util';
import { Sparkles } from 'lucide-react';
import {
  FormEvent,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  blockGenerate?: boolean;
  loadingGenerate?: boolean;
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
  blockGenerate = false,
  loadingGenerate = false,
  ...props
}: TextAreaProps) {
  const [value, setValue] = useState(props.value);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    if (handleGenerate && !blockGenerate && !loadingGenerate) {
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
          {`${label}${required ? ' *' : ' (optional)'}`}
        </span>
      )}
      <span className='relative'>
        <textarea
          {...props}
          ref={textAreaRef}
          className={cn([
            touched && !valid ? '!border-red-400' : '',
            touched && valid ? '!border-green-400' : '',
            'relative flex w-full items-center gap-4 rounded-md border border-gray-300 bg-gray-100 p-2 px-4 dark:border-slate-800 dark:bg-slate-900',
            'h-auto resize-y text-sm outline-none ring-green-400/50 transition-all focus:ring',
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
          aria-invalid={touched && !valid ? 'true' : 'false'}
        ></textarea>

        {handleGenerate && (
          <Button
            type='button'
            variant={'secondary'}
            size={'icon-xs'}
            className='absolute right-[10px] top-[10px] z-40 disabled:cursor-not-allowed'
            onClick={generate}
            icon={<Sparkles className='size-3' />}
            loading={loadingGenerate}
            disabled={blockGenerate}
            alt='Generate'
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
