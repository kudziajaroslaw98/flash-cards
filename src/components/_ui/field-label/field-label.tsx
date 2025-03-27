import { cn } from '#/shared/utils/cn.util';

interface FieldLabelProps {
  touched: boolean;
  valid: boolean;
  required: boolean;
  label: string;
}

export const FieldLabel = ({
  touched,
  valid,
  required,
  label,
}: FieldLabelProps) => {
  return (
    <span className='w-auto pb-2 pl-2 '>
      <span
        className={cn([
          touched && !valid ? '!text-red-400' : '',
          touched && valid ? '!text-green-400' : '',
          'w-auto pb-2 pl-2 text-sm text-gray-600 dark:text-slate-300',
        ])}
      >
        {label}
      </span>
      <span
        className={cn([
          'text-xs',
          touched && !valid ? '!text-red-400' : '',
          touched && valid ? '!text-green-400' : '',
          'text-gray-400 dark:text-slate-500',
        ])}
      >
        {required ? ' *' : ' (optional)'}
      </span>
    </span>
  );
};
