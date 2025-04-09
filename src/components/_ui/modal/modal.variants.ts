import { cva } from 'class-variance-authority';

export const modalHeaderVariants = cva(
  'text-lg font-bold flex w-full items-center justify-between border-gray-200 dark:border-slate-800',
  {
    variants: {
      variant: {
        default: 'px-6 py-4 pt-8',
        alert: 'justify-center px-6 pb-2 pt-4',
        form: 'px-6 py-4',
        compact: 'px-4 py-3',
      },
      borderVisible: {
        true: 'border-b',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      borderVisible: true,
    },
  },
);

export const modalBodyVariants = cva(
  'flex w-full max-h-[600px] flex-col text-sm text-slate-500',
  {
    variants: {
      variant: {
        default: 'px-4 py-4',
        alert: 'text-center px-6 pt-1 pb-4',
        form: 'py-4',
        compact: 'px-4 py-2',
      },
      borderVisible: {
        true: 'border-y',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      borderVisible: false,
    },
  },
);

export const modalFooterVariants = cva(
  'w-full border-gray-200 dark:border-slate-800',
  {
    variants: {
      variant: {
        default: 'px-6 py-4',
        alert: 'px-6 pb-4 pt-2 justify-center flex w-full gap-2',
        form: 'px-6 py-4 items-center justify-center lg:justify-end',
        compact: 'px-4 py-3',
      },
      borderVisible: {
        true: 'border-t',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      borderVisible: true,
    },
  },
);
