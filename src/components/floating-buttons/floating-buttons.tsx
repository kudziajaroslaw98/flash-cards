import { cn } from '#/shared/utils/cn.util';
import * as m from 'motion/react-m';
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
        'fixed  bottom-0 left-0 flex w-full flex-row flex-wrap justify-center gap-4 p-4 md:gap-2 lg:px-16',
        'z-30 bg-transparent',
        className,
      ])}
    >
      <div className='relative z-30 flex w-full flex-row flex-wrap justify-center gap-4 md:gap-2'>
        {children}
      </div>

      <div className='absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-transparent bg-[radial-gradient(transparent_1px,#f9fafb_1px)] from-transparent via-black via-20% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-b dark:bg-[radial-gradient(transparent_1px,#020617_1px)]' />
    </m.div>
  );
};
