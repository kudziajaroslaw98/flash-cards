import type { PropsWithChildren } from 'react';
import { cn } from '#/shared/utils/cn.util';

type SwitchProps =
  | {
      showLabel: false;
      value: boolean;
      variant?: 'vertical' | 'vertical-reversed';
      onClick: () => void;
    }
  | {
      showLabel: true;
      value: boolean;
      checkedLabel: string;
      uncheckedLabel: string;
      variant: 'vertical' | 'vertical-reversed';
      onClick: () => void;
    };

export default function Switch({
  variant = 'vertical',
  ...props
}: PropsWithChildren<SwitchProps>) {
  return (
    <label
      className={cn([
        'relative cursor-pointer items-center',
        variant === 'vertical' && 'inline-flex',
        variant === 'vertical-reversed' && 'inline-flex flex-row-reverse',
      ])}
    >
      <input
        onChange={() => {
          props.onClick();
        }}
        type='checkbox'
        checked={props.value}
        className='peer sr-only'
      />
      <div
        className={cn([
          'relative h-6 w-10 rounded-full bg-gray-200 dark:bg-slate-900',
        ])}
      >
        <div
          className={cn([
            'absolute start-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-gray-50 transition content-[""] dark:bg-slate-700',
            props.value &&
              'translate-x-[16px] border-white bg-green-500 dark:bg-green-500',
          ])}
        >
          {props.children}
        </div>
      </div>

      {props.showLabel && (
        <span
          className={cn([
            'text-sm text-green-500 dark:text-slate-200',
            variant === 'vertical' && 'ml-3',
            variant === 'vertical-reversed' && 'mr-3',
          ])}
        >
          {props.value ? props.checkedLabel : props.uncheckedLabel}
        </span>
      )}
    </label>
  );
}
