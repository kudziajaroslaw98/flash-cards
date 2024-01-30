import useToast from '#/hooks/use-toast.hook';
import { createContext, PropsWithChildren, useMemo } from 'react';

export default function ToastProvider(props: Readonly<PropsWithChildren>) {
  const { toasts, show, close, clear } = useToast();
  const providerValue = useMemo(
    () => ({ toasts, show, close, clear }),
    [toasts, show, close, clear],
  );

  const ToastContext = createContext({});

  return (
    <ToastContext.Provider value={providerValue}>
      {props.children}
    </ToastContext.Provider>
  );
}
