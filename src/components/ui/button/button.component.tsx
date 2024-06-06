import { cn } from '#/shared/utils/cn.util';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  `inline-flex w-full max-w-80 items-center justify-center gap-2 rounded-md border transition active:scale-95 disabled:!border-gray-300 disabled:!bg-transparent disabled:!text-gray-400 disabled:!opacity-80 dark:disabled:!bg-transparent`,
  {
    variants: {
      variant: {
        primary:
          'border-transparent text-gray-50 bg-green-400 border-green-500 hover:bg-green-500 active:focus:bg-green-600',
        'primary-outline':
          'text-green-500 hover:text-gray-50 bg-transparent border border-green-500 hover:bg-green-400 active:focus:bg-green-500',
        'primary-text':
          'text-green-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-green-400 active:focus:bg-green-500',
        destructive:
          'border-transparent text-gray-50 bg-red-400 border-red-500 hover:bg-red-500 active:focus:bg-red-600 dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-600 dark:active:focus:bg-red-700',
        'destructive-outline':
          'text-red-500 hover:text-gray-50 bg-transparent border border-red-500 hover:bg-red-500 active:focus:bg-red-600',
        'destructive-text':
          'text-red-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-red-500 active:focus:bg-red-600',
        secondary:
          'border-transparent text-gray-50 bg-blue-400 border-blue-500 hover:bg-blue-500 active:focus:bg-blue-600',
        'secondary-outline':
          'text-blue-500 hover:text-gray-50 bg-transparent border border-blue-500 hover:bg-blue-500 active:focus:bg-blue-600',
        'secondary-text':
          'text-blue-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-blue-500 active:focus:bg-blue-600',
      },
      size: {
        default: 'h-10 px-4 py-2 md:w-auto',
        sm: 'h-9 px-3 md:w-auto',
        lg: 'h-11 px-8 md:w-auto',
        xlg: 'h-11 px-14 md:w-auto',
        icon: 'h-10 min-w-10 md:w-10',
        'icon-mini': 'size-5',
        full: 'w-full h-10 !max-w-auto',
      },
      iconPosition: {
        left: 'flex-row',
        right: 'flex-row-reverse',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, disabled, loading, size, iconPosition, ...props },
    ref,
  ) => {
    return (
      <button
        disabled={disabled || loading}
        ref={ref}
        className={cn([
          buttonVariants({ variant, size, iconPosition, className }),
        ])}
        {...props}
      >
        {loading && <ArrowPathIcon className={'h-4 w-4 animate-spin'} />}

        {!loading && props.icon}

        {props?.label && props.label}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
