import { cn } from '#/shared/utils/cn.util';
import { ReactNode } from 'react';

export const ModalFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <footer
      className={cn([
        'w-full border-t border-gray-200 px-6 py-4 dark:border-slate-800',
        className,
      ])}
    >
      {children}
    </footer>
  );
};
