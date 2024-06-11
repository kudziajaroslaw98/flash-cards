import { cn } from '#/shared/utils/cn.util';
import { ReactNode } from 'react';

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <main className={cn(['flex w-full flex-col px-6 py-4', className])}>
      {children}
    </main>
  );
};
