import { DialogContext } from '#/providers/dialog.providers';
import { cn } from '#/shared/utils/cn.util';
import { VariantProps } from 'class-variance-authority';
import { Trash, X } from 'lucide-react';
import { ReactNode, useContext } from 'react';
import { Button } from '../button/button';
import { modalHeaderVariants } from './modal.variants';

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
  const {
    isCloseButtonVisible,
    onDialogClose,
    isDeleteButtonVisible,
    onDialogDelete,
  } = useContext(DialogContext);

  return (
    <div
      className={cn(modalHeaderVariants({ variant, borderVisible, className }))}
    >
      {children}

      <div className='flex items-center justify-center gap-4'>
        {isDeleteButtonVisible && (
          <Button
            type='button'
            variant='destructive-outline'
            label='Delete'
            size='sm'
            iconPosition='right'
            icon={<Trash className='h-4 w-4' />}
            onClick={onDialogDelete}
            alt='Delete'
            className='!h-7 text-[0.7rem]'
          />
        )}

        {isCloseButtonVisible && (
          <Button
            type='button'
            variant='destructive-text'
            size='icon-sm'
            icon={<X className='h-4 w-4' />}
            onClick={onDialogClose}
            alt='Close'
          />
        )}
      </div>
    </div>
  );
};
