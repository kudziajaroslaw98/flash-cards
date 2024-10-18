import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import {
  createContext,
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

export interface DialogProps
  extends PropsWithChildren<
    DetailedHTMLProps<HTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
  > {
  open?: boolean;
  onDialogClose: () => void;
  closeOnBackdropClick?: boolean;
  isCloseButtonVisible?: boolean;
  className?: string;
}

export const DialogContext = createContext({
  isCloseButtonVisible: true,
  onDialogClose: () => {},
});

const Dialog = ({
  children,
  onDialogClose,
  open = false,
  closeOnBackdropClick = false,
  isCloseButtonVisible = true,
}: DialogProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideAlerter(ref, () => {
    if (onDialogClose && closeOnBackdropClick) {
      onDialogClose();
    }
  });

  return (
    <>
      {open &&
        createPortal(
          <DialogContext.Provider
            value={{ isCloseButtonVisible, onDialogClose }}
          >
            <div className='fixed right-0 top-0 z-50 h-screen w-screen bg-black/75 backdrop-blur-sm'>
              <div
                className='flex h-full w-full  items-center justify-center gap-4'
                ref={ref}
              >
                {children}
              </div>
            </div>
          </DialogContext.Provider>,
          document.body,
        )}
    </>
  );
};

Dialog.displayName = 'Dialog';

export default Dialog;
