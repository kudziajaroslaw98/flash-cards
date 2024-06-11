import { ReactNode } from 'react';

export const ModalFooter = ({ children }: { children: ReactNode }) => {
  return (
    <footer className='w-full border-t border-gray-200 px-6 py-4 dark:border-slate-800'>
      {children}
    </footer>
  );
};
