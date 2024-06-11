import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import {
  createContext,
  useRef,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';
import { ModalBody } from './modal-body.component';
import { ModalFooter } from './modal-footer.component';
import { ModalHeader } from './modal-header.component';

export interface ModalProps
  extends DetailedHTMLProps<
    HTMLAttributes<HTMLDialogElement>,
    HTMLDialogElement
  > {
  open?: boolean;
  onDialogClose: () => void;
  closeOnBackdropClick?: boolean;
  closeVisible?: boolean;
  className?: string;
}

export const ModalContext = createContext({
  closeVisible: true,
  onDialogClose: () => {},
});

const Modal = ({
  onDialogClose,
  className,
  open = false,
  closeOnBackdropClick = false,
  closeVisible = true,
  ...props
}: PropsWithChildren<ModalProps>) => {
  const ref = useRef<HTMLDialogElement>(null);

  useOutsideAlerter(ref, () => {
    if (onDialogClose && closeOnBackdropClick) {
      onDialogClose();
    }
  });

  return (
    <>
      {open &&
        createPortal(
          <ModalContext.Provider value={{ closeVisible, onDialogClose }}>
            <div className='fixed right-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-sm'>
              <dialog
                className={cn([
                  'transition open:animate-fade-in',
                  'w-11/12 rounded-md bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-100',
                  className,
                ])}
                open={open}
                ref={ref}
                {...props}
              >
                {props.children}
              </dialog>
            </div>
          </ModalContext.Provider>,
          document.body,
        )}
    </>
  );
};

Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;
Modal.Body = ModalBody;

Modal.displayName = 'Modal';
export default Modal;
