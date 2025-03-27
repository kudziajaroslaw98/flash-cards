import { cn } from '#/shared/utils/cn.util';
import { cva } from 'class-variance-authority';
import React from 'react';
import AccordionProvider from './accordion-context';
import { AccordionItem } from './accordion-item';

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

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'form';
}

export const Accordion = ({
  children,
  className,
  variant = 'default',
}: AccordionProps) => {
  return (
    <div className={cn(['w-full max-w-2xl', className])}>
      <div className={cn([accordionVariants({ variant })])}>
        <AccordionProvider>{children}</AccordionProvider>
      </div>
    </div>
  );
};

Accordion.displayName = 'Accordion';
Accordion.Item = AccordionItem;
