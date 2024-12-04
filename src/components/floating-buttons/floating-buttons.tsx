import { cn } from '#/shared/utils/cn.util';
import * as m from 'framer-motion/m';
import { ReactNode } from 'react';

interface FloatingButtonsProps {
  children: ReactNode;
  className?: string;
}

export const FloatingButtons = ({
  children,
  className = '',
}: FloatingButtonsProps) => {
  return (
    <m.div
      layout
      className={cn([
        'sticky bottom-0 left-0 flex w-full flex-row flex-wrap justify-center gap-4 p-4 md:gap-2 lg:px-16',
        'z-20 bg-gray-50/5 backdrop-blur-[8px] dark:bg-slate-900/5',
        className,
      ])}
    >
      {children}
    </m.div>
  );
};
