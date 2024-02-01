'use client';

import useToast from '#/hooks/use-toast.hook';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

type ToastContextType = ReturnType<typeof useToast>;

export const ToastContext = createContext<ToastContextType | null>(null);

export default function ToastProvider(props: Readonly<PropsWithChildren>) {
  const { toasts, show, close, clear } = useToast();
  const providerValue = useMemo(
    () => ({ toasts, show, close, clear }),
    [toasts, show, close, clear],
  );

  return (
    <ToastContext.Provider value={providerValue}>
      {props.children}
    </ToastContext.Provider>
  );
}

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }

  return context;
};
