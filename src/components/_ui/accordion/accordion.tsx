import { cn } from '#/shared/utils/cn.util';
import uuid from '#/shared/utils/uuid.util';
import { ChevronDownIcon } from 'lucide-react';
import * as m from 'motion/react-m';
import React, { useRef } from 'react';
import AccordionProvider, { useAccordionContext } from './accordion-context';

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  multiple?: boolean;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const Accordion = ({ children, className }: AccordionProps) => {
  return (
    <div className={cn(['w-full max-w-2xl', className])}>
      <AccordionProvider>{children}</AccordionProvider>
    </div>
  );
};

export const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const key = useRef(uuid());
  const { openKeys, toggleIndex } = useAccordionContext();
  const isOpen = openKeys.includes(key.current);

  const handleClick = () => {
    toggleIndex(key.current, true);
  };

  return (
    <div className='overflow-hidden rounded-md border'>
      <m.button
        className='flex w-full items-center justify-between p-2 transition-colors hover:bg-gray-100'
        onClick={handleClick}
      >
        <span className='text-left text-sm font-medium'>{title}</span>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className='h-5 w-5 text-gray-600' />
        </m.div>
      </m.button>

      <m.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className='overflow-hidden px-4'
      >
        <div className='pb-4 pt-2 text-gray-600'>{children}</div>
      </m.div>
    </div>
  );
};

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
Accordion.Item = AccordionItem;
