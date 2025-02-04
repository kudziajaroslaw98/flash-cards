import { cn } from '#/shared/utils/cn.util';
import React from 'react';
import AccordionProvider from './accordion-context';
import { AccordionItem } from './accordion-item';

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  multiple?: boolean;
}

export const Accordion = ({ children, className }: AccordionProps) => {
  return (
    <div className={cn(['w-full max-w-2xl', className])}>
      <AccordionProvider>{children}</AccordionProvider>
    </div>
  );
};

Accordion.displayName = 'Accordion';
Accordion.Item = AccordionItem;
