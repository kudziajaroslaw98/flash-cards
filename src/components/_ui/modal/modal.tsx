import { cn } from '#/shared/utils/cn.util';
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { ModalBody } from './modal-body';
import { ModalFooter } from './modal-footer';
import { ModalHeader } from './modal-header';

export interface ModalProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  className?: string;
}

const Modal = ({ className, ...props }: PropsWithChildren<ModalProps>) => {
  return (
    <>
      <div
        className={cn([
          'flex flex-col',
          'transition open:animate-fade-in',
          'rounded-md bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-100',
          className,
        ])}
        {...props}
      >
        {props.children}
      </div>
    </>
  );
};

Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;
Modal.Body = ModalBody;

Modal.displayName = 'Modal';
export default Modal;
