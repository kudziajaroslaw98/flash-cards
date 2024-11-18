import { cn } from '#/shared/utils/cn.util';
import { ReactNode } from 'react';

export const ModalFooter = ({
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
        'w-full border-gray-200  dark:border-slate-800',
        borderVisible && 'border-t',
        className,
      ])}
    >
      {children}
    </div>
  );
};
