import { ArrowPathIcon } from '@heroicons/react/24/solid';
import type { PropsWithChildren } from 'react';

export interface ButtonProps {
  label?: string;
  class?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export default function ButtonComponent(props: PropsWithChildren<ButtonProps>) {
  const getIconPosition = () => {
    switch (props.iconPosition) {
      case 'left':
        return 'flex-row-reverse';
      case 'right':
        return 'flex-row';
      default:
        return 'flex-row';
    }
  };

  return (
    <button
      disabled={props.disabled}
      className={`
      flex h-12 w-full items-center justify-center gap-2 rounded-md border border-transparent p-2 text-gray-50 transition 
      active:scale-95 
      disabled:border-gray-300 disabled:bg-transparent disabled:text-gray-400 disabled:opacity-80 
      dark:disabled:bg-transparent  
       ${props.class} ${getIconPosition}`}
      onClick={() => (props?.onClick ? props.onClick() : null)}
    >
      {props.loading && <ArrowPathIcon className={'h-4 w-4 animate-spin'} />}

      {!props.loading && props.icon}

      {props?.label && props.label}
    </button>
  );
}
