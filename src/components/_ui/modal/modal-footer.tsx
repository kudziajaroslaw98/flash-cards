import { ReactNode } from 'react';
import { cn } from '#/shared/utils/cn.util';
import { modalFooterVariants } from './modal.variants';
import { VariantProps } from 'class-variance-authority';

interface ModalFooterProps extends VariantProps<typeof modalFooterVariants> {
  children: ReactNode;
  className?: string;
}

export const ModalFooter = ({
  children,
  className,
  variant,
  borderVisible,
}: ModalFooterProps) => {
  return (
    <div className={cn(modalFooterVariants({ variant, borderVisible, className }))}>
      {children}
    </div>
  );
};
