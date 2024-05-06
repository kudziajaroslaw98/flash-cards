import type { PropsWithChildren } from 'react';

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

export default function SwitchComponent(props: PropsWithChildren<SwitchProps>) {
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
      <div className='relative h-6 w-11 rounded-full bg-gray-200 dark:bg-slate-700'>
        <div
          className={`absolute start-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-gray-50 transition content-[""] ${
            props.value
              ? 'translate-x-full border-white bg-green-800 dark:bg-green-500'
              : ''
          }`}
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
