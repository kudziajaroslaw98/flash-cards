import { createContext, useContext, type PropsWithChildren } from 'react';

export type DialogContextType = {
  isCloseButtonVisible: boolean;
  onDialogClose: () => void;
};

export const DialogContext = createContext<DialogContextType>({
  isCloseButtonVisible: true,
  onDialogClose: () => {},
});

export type DialogProviderProps = DialogContextType & PropsWithChildren;

export default function DialogProvider({
  isCloseButtonVisible,
  onDialogClose,
  children,
}: DialogProviderProps) {
  return (
    <DialogContext.Provider value={{ isCloseButtonVisible, onDialogClose }}>
      {children}
    </DialogContext.Provider>
  );
}

export const useToastContext = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialogContext must be used within DialogProvider');
  }

  return context;
};
