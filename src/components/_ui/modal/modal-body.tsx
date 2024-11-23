import { ReactNode } from 'react';
import { cn } from '#/shared/utils/cn.util';
import { modalBodyVariants } from './modal.variants';
import { VariantProps } from 'class-variance-authority';

interface ModalBodyProps extends VariantProps<typeof modalBodyVariants> {
  children: ReactNode;
  className?: string;
}

export const ModalBody = ({
  children,
  className,
  variant,
  borderVisible,
}: ModalBodyProps) => {
  return (
    <div className={cn(modalBodyVariants({ variant, borderVisible, className }))}>
      {children}
    </div>
  );
};
