import { DialogContext } from '#/providers/dialog.providers';
import { VariantProps } from 'class-variance-authority';
import { modalHeaderVariants } from './modal.variants';
import { ReactNode, useContext } from 'react';
import { cn } from '#/shared/utils/cn.util';
import { Button } from '../button/button';
import { X } from 'lucide-react';

interface ModalHeaderProps extends VariantProps<typeof modalHeaderVariants> {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({
  children,
  className,
  variant,
  borderVisible,
}: ModalHeaderProps) => {
  const { isCloseButtonVisible, onDialogClose } = useContext(DialogContext);

  return (
    <div
      className={cn(modalHeaderVariants({ variant, borderVisible, className }))}
    >
      {children}

      {isCloseButtonVisible && (
        <Button
          variant='destructive-text'
          size='icon-sm'
          icon={<X className='h-4 w-4' />}
          onClick={onDialogClose}
        />
      )}
    </div>
  );
};
