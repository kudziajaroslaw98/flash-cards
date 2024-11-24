import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useRef,
} from 'react';
import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import DialogProvider from '#/providers/dialog.providers';
import { Trigger } from '#/components/_shared/trigger';
import useKeyPress from '#/hooks/use-key-press.hook';
import { createPortal } from 'react-dom';

export const DialogContext = createContext({
  isCloseButtonVisible: true,
  onDialogClose: () => {},
});

export type DialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: React.ReactNode;
  onDialogClose: () => void;
  onDialogSubmit?: () => void;
  isCloseButtonVisible?: boolean;
  closeOnBackdropClick?: boolean;
  submitRef?: React.RefObject<HTMLButtonElement>;
} & PropsWithChildren;

export const Dialog = ({
  open,
  submitRef,
  setOpen,
  onDialogClose,
  onDialogSubmit,
  isCloseButtonVisible = true,
  closeOnBackdropClick = false,
  ...props
}: DialogProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideAlerter(ref, () => {
    window.umami.track('Dialog - backdrop clicked');
    if (onDialogClose && closeOnBackdropClick) {
      onDialogClose();
    }
  });

  const handleEnter = useCallback(
    (e: KeyboardEvent) => {
      window.umami.track('Dialog - enter clicked');

      const target = e.target as HTMLElement;

      if (open && target === submitRef?.current && onDialogSubmit) {
        e.preventDefault();
        onDialogSubmit();
      }
    },
    [open, submitRef, onDialogSubmit],
  );

  const handleEscape = useCallback(() => {
    window.umami.track('Dialog - escape clicked');

    if (open && onDialogClose) {
      onDialogClose();
    }
  }, [open, onDialogClose]);

  const toggleDialog = () => {
    setOpen((prev) => !prev);
  };

  useKeyPress(['Escape'], handleEscape);
  useKeyPress(['Enter'], handleEnter);

  return (
    <>
      <Trigger trigger={toggleDialog}>{props.trigger}</Trigger>
      {open &&
        createPortal(
          <DialogProvider
            isCloseButtonVisible={isCloseButtonVisible}
            onDialogClose={onDialogClose}
          >
            <div className='fixed right-0 top-0 z-[100] h-screen w-screen bg-black/75 backdrop-blur-sm'>
              <div
                className='flex h-full w-full  items-center justify-center gap-4'
                ref={ref}
              >
                {props.children}
              </div>
            </div>
          </DialogProvider>,
          document.body,
        )}
    </>
  );
};
