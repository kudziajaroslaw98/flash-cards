import type { PropsWithChildren } from 'react';
import { cn } from '#/shared/utils/cn.util';

type SwitchProps =
  | {
      showLabel: false;
      value: boolean;
      onClick: () => void;
    }
  | {
      showLabel: true;
      value: boolean;
      checkedLabel: string;
      uncheckedLabel: string;
      onClick: () => void;
    };

export default function Switch(props: PropsWithChildren<SwitchProps>) {
  return (
    <label className='relative inline-flex cursor-pointer items-center'>
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
        <span className='ms-3 text-sm text-green-500 dark:text-slate-200'>
          {props.value ? props.checkedLabel : props.uncheckedLabel}
        </span>
      )}
    </label>
  );
}
