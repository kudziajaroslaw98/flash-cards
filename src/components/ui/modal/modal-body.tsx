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
    <div className={cn(['flex w-full flex-col', className])}>{children}</div>
  );
};
