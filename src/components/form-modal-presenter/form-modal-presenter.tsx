import type { FormScheme } from '#/types/form-scheme.type';
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useRef,
} from 'react';
import { Button } from '../_ui/button/button';
import { Dialog, type DialogProps } from '../_ui/dialog/dialog';
import Modal, { ModalProps } from '../_ui/modal/modal';
import FormComponent, { type FormMethods } from '../form-component/form';

interface FormModalPresenterProps<T> {
  // State and handlers from the hook
  isModalOpen: boolean;
  handleModalOpenChange: Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
  handleSaveAttempt: (
    formRef: RefObject<FormMethods<T> | null>,
  ) => Promise<void>;
  isSaving: boolean;

  // Configuration and Content
  trigger?: React.ReactNode;
  modalTitle: string;
  submitButtonLabel: string;
  itemTypeLabel?: string; // Optional: for alt text, e.g., "Assign Flashcards"
  initialData?: T;
  schema: FormScheme<T>; // Pass schema to render prop

  // Optional pass-through props
  dialogProps?: Omit<
    DialogProps,
    'open' | 'setOpen' | 'trigger' | 'onDialogClose' | 'onDialogSubmit'
  >;
  modalProps?: Omit<ModalProps, 'children'>; // Children are handled internally
}

export function FormModalPresenter<T>({
  isModalOpen,
  handleModalOpenChange,
  handleClose,
  handleSaveAttempt,
  isSaving,
  trigger,
  modalTitle,
  submitButtonLabel,
  itemTypeLabel,
  schema,
  initialData, // Default to empty array
  dialogProps,
  modalProps,
}: FormModalPresenterProps<T>) {
  const multiFormRef = useRef<FormMethods<T>>(null); // Ref for MultiFormComponent
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleDialogSubmit = () => {
    handleSaveAttempt(multiFormRef); // Pass the multi-form ref
  };

  return (
    <Dialog
      open={isModalOpen}
      setOpen={handleModalOpenChange}
      trigger={trigger}
      onDialogClose={handleClose}
      onDialogSubmit={handleDialogSubmit}
      submitRef={submitRef}
      {...dialogProps}
    >
      <Modal
        className='w-full'
        {...modalProps}
      >
        <Modal.Header variant={'form'}>{modalTitle}</Modal.Header>
        <Modal.Body
          variant={'form'}
          className='flex flex-col items-center justify-center pb-8 pt-4'
        >
          {/* Render MultiFormComponent */}
          <FormComponent<T>
            ref={multiFormRef}
            className='w-full max-w-96'
            scheme={schema}
            initialValues={initialData} // Pass initialData array
            // emitFormValues, emitFormValid could be passed here if needed
          />
        </Modal.Body>
        <Modal.Footer
          variant={'form'}
          className='flex items-center justify-end gap-2 py-4'
        >
          <Button
            ref={submitRef}
            type='button'
            label={submitButtonLabel}
            onClick={handleDialogSubmit}
            size={'sm'}
            variant={'primary-text'}
            alt={
              itemTypeLabel
                ? `${submitButtonLabel} ${itemTypeLabel}`
                : submitButtonLabel
            }
            loading={isSaving}
            disabled={isSaving}
          />
        </Modal.Footer>
      </Modal>
    </Dialog>
  );
}
