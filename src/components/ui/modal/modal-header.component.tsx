import { XMarkIcon } from '@heroicons/react/24/solid';
import { ReactNode, useContext } from 'react';
import { Button } from '../button/button.component';
import { ModalContext } from './modal.component';

export const ModalHeader = ({ children }: { children: ReactNode }) => {
  const { closeVisible, onDialogClose } = useContext(ModalContext);

  return (
    <header className='flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-800'>
      {children}

      {closeVisible && (
        <Button
          variant='destructive-text'
          size='icon-sm'
          icon={<XMarkIcon className='h-4 w-4' />}
          onClick={onDialogClose}
        />
      )}
    </header>
  );
};
