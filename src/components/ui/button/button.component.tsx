import { ArrowPathIcon } from '@heroicons/react/24/solid';
import type { PropsWithChildren } from 'react';

export interface ButtonProps {
  class?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function ButtonComponent(props: PropsWithChildren<ButtonProps>) {
  return (
    <button
      disabled={props.disabled}
      className={`
      flex h-12 w-full items-center justify-center gap-2 rounded-md border border-transparent px-4 text-gray-50 transition 
      active:scale-95 
      disabled:border-gray-300 disabled:bg-transparent disabled:text-gray-400 disabled:opacity-80 
      sm:w-auto md:h-10 
      dark:disabled:bg-transparent ${props.class}`}
      onClick={() => (props?.onClick ? props.onClick() : null)}
    >
      {props.loading && <ArrowPathIcon className={'h-4 w-4 animate-spin'} />}
      {!props.loading && props.icon}
      {props.children}
    </button>
  );
}
