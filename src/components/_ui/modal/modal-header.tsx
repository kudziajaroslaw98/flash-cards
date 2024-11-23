import { DialogContext } from '#/providers/dialog.providers';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ReactNode, useContext } from 'react';
import { cn } from '#/shared/utils/cn.util';
import { Button } from '../button/button';
import { modalHeaderVariants } from './modal.variants';
import { VariantProps } from 'class-variance-authority';

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
    <div className={cn(modalHeaderVariants({ variant, borderVisible, className }))}>
      {children}

      {isCloseButtonVisible && (
        <Button
          variant='destructive-text'
          size='icon-sm'
          icon={<XMarkIcon className='h-4 w-4' />}
          onClick={onDialogClose}
        />
      )}
    </div>
  );
};
