import { DialogContext } from '#/providers/dialog.providers';
import { cn } from '#/shared/utils/cn.util';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ReactNode, useContext } from 'react';
import { Button } from '../button/button';

export const ModalHeader = ({
  children,
  className,
  borderVisible = true,
}: {
  children: ReactNode;
  className?: string;
  borderVisible?: boolean;
}) => {
  const { isCloseButtonVisible, onDialogClose } = useContext(DialogContext);

  return (
    <div
      className={cn([
        'text-lg font-bold',
        'flex w-full items-center justify-between border-gray-200 dark:border-slate-800',
        borderVisible ? 'border-b px-6 py-4' : 'px-6 py-4 pt-8',
        className,
      ])}
    >
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
