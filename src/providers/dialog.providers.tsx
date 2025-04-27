import { createContext, useContext, type PropsWithChildren } from 'react';

export type DialogContextType = {
  isCloseButtonVisible: boolean;
  isDeleteButtonVisible?: boolean;
  onDialogClose: () => void;
  onDialogDelete?: () => void;
};

export const DialogContext = createContext<DialogContextType>({
  isCloseButtonVisible: true,
  isDeleteButtonVisible: true,
  onDialogClose: () => {},
  onDialogDelete: () => {},
});

export type DialogProviderProps = DialogContextType & PropsWithChildren;

export default function DialogProvider({
  isCloseButtonVisible,
  isDeleteButtonVisible,
  onDialogClose,
  onDialogDelete,
  children,
}: DialogProviderProps) {
  return (
    <DialogContext.Provider
      value={{
        isCloseButtonVisible,
        onDialogClose,
        isDeleteButtonVisible,
        onDialogDelete,
      }}
    >
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
