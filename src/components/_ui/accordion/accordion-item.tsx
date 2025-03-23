import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import { useRef } from 'react';
import { useAccordionContext } from './accordion-context';

const accordionLabelVariants = cva(
  'group flex w-full items-center justify-between p-2 transition-colors group-first:border-t-0 border-t dark:border-slate-800 border-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 outline-none',
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
  title: string | React.ReactNode;
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

  return (
    <div className='group w-full'>
      <m.button
        className={cn([accordionLabelVariants({ variant })])}
        onClick={handleClick}
      >
        <span className='text-left text-sm font-medium text-gray-600 dark:text-slate-300'>
          {title}
        </span>
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
