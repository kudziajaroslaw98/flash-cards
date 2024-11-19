import { cn } from '#/shared/utils/cn.util';
import { ReactNode } from 'react';

export const ModalBody = ({
  children,
  className,
  borderVisible = true,
}: {
  children: ReactNode;
  className?: string;
  borderVisible?: boolean;
}) => {
  return (
    <div
      className={cn([
        'flex w-full flex-col text-sm text-slate-500',
        borderVisible ? 'px-6 py-6' : 'px-6 py-2',
        className,
      ])}
    >
      {children}
    </div>
  );
};
