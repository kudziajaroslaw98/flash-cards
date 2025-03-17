import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import { useRef } from 'react';
import { useAccordionContext } from './accordion-context';

// const buttonVariants = cva(
// `group outline has-[:focus]:ring has-[:focus]:ring-green-400/50 inline-flex w-full max-w-80 items-center text-sm justify-center gap-2 rounded-md border transition active:scale-95 disabled:!border-gray-300 dark:disabled:!border-gray-800 disabled:!bg-transparent disabled:!text-gray-400 dark:disabled:!bg-transparent disabled:opacity-50 disabled:cursor-not-allowed ring-0 outline-0 focus:ring ring-green-400/50`,
// {
//   variants: {
//     variant: {
//       disabled: '',
//       'disabled-outline':
//         'border-gray-300 dark:border-slate-800 bg-transparent text-gray-500 dark:bg-transparent',
//       'disabled-text':
//         'hover:bg-gray-200/50 dark:hover:bg-slate-800/50 border-transparent dark:border-transparent',
//       'disabled-fill':
//         'text-gray-500 bg-gray-200/50 hover:bg-gray-200/25 dark:bg-slate-800/50 dark:hover:bg-slate-800/25 border-transparent dark:border-transparent',
//       primary:
//         'border-transparent text-gray-50 bg-green-400 border-green-500 hover:bg-green-500 active:focus:bg-green-600',
//       'primary-outline':
//         'text-green-500 hover:text-gray-50 bg-transparent border border-green-500 hover:bg-green-400 active:focus:bg-green-500',
//       'primary-text':
//         'text-green-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-green-400 active:focus:bg-green-500',
//       destructive:
//         'border-transparent text-gray-50 bg-red-400 border-red-500 hover:bg-red-500 active:focus:bg-red-600 dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-600 dark:active:focus:bg-red-700',
//       'destructive-outline':
//         'text-red-500 hover:text-gray-50 bg-transparent border border-red-500 hover:bg-red-500 active:focus:bg-red-600',
//       'destructive-text':
//         'text-red-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-red-500 active:focus:bg-red-600',
//       secondary:
//         'border-transparent text-gray-50 bg-blue-400 border-blue-500 hover:bg-blue-500 active:focus:bg-blue-600',
//       'secondary-outline':
//         'text-blue-500 hover:text-gray-50 bg-transparent border border-blue-500 hover:bg-blue-500 active:focus:bg-blue-600',
//       'secondary-text':
//         'text-blue-500 hover:text-gray-50 bg-transparent border-transparent  hover:bg-blue-500 active:focus:bg-blue-600',
//     },
//     size: {
//       default: 'h-10 px-4 py-2 md:w-auto',
//       sm: 'h-9 px-3 md:w-auto text-sm',
//       lg: 'h-10 px-8 md:w-auto',
//       xlg: 'h-10 px-14 md:w-auto',
//       icon: 'h-10 min-w-10 md:w-10',
//       'icon-square': 'h-10 w-10',
//       'icon-sm': 'size-7',
//       'icon-xs': 'size-5',
//       full: 'w-full h-10 !max-w-auto',
//     },
//     iconPosition: {
//       left: 'flex-row',
//       right: 'flex-row-reverse',
//     },
//   },
//   defaultVariants: {
//     variant: 'primary',
//     size: 'default',
//   },
// },

const accordionVariants = cva(
  'overflow-hidden rounded-md border outline-none',
  {
    variants: {
      variant: {
        form: 'border-gray-300 dark:border-slate-800',
        default: 'border-gray-300 dark:border-slate-800',
        destructive: 'border-red-500 dark:border-red-500',
      },
    },
  },
);

const accordionLabelVariants = cva(
  'group flex w-full items-center justify-between p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-900 outline-none',
  {
    variants: {
      variant: {
        form: 'text-gray-500 dark:text-slate-400 p-3',
        default: 'text-gray-500 dark:text-slate-400',
        destructive: 'text-red-500 dark:text-red-400',
      },
    },
  },
);

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'form';
}

export const AccordionItem = ({
  title,
  children,
  variant = 'default',
}: AccordionItemProps) => {
  const key = useRef(uuid());
  const { openKeys, toggleIndex } = useAccordionContext();
  const isOpen = openKeys.includes(key.current);

  const handleClick = () => {
    toggleIndex(key.current, true);
  };
  //  text-gray-200 dark:bg-slate-900 dark:text-slate-800
  return (
    <div className={cn([accordionVariants({ variant })])}>
      <m.button
        className={cn([accordionLabelVariants({ variant })])}
        onClick={handleClick}
      >
        <span className='text-left text-sm font-medium'>{title}</span>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          tabIndex={1}
        >
          <ChevronDownIcon className='h-5 w-5 rounded-md outline-0 ring-0 ring-green-400/50 group-focus:ring' />
        </m.div>
      </m.button>

      <m.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn([
          'overflow-hidden px-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ])}
      >
        <div className='pb-4 pt-2 text-gray-500 dark:text-slate-400'>
          {children}
        </div>
      </m.div>
    </div>
  );
};

AccordionItem.displayName = 'AccordionItem';
