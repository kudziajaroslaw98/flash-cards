import { ReactNode } from 'react';

export const ModalBody = ({ children }: { children: ReactNode }) => {
  return <main className='flex w-full grow flex-col px-6'>{children}</main>;
};
