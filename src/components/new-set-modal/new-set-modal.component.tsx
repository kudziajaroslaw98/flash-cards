import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { useState } from 'react';

import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface NewSetModalProps {
  isDialogOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewSet: (
    set: Partial<Record<keyof typeof newSetFormScheme.inputs, string>>,
  ) => void;
}

export const NewSetModal = ({
  isDialogOpen,
  setIsModalOpen,
  handleNewSet,
}: NewSetModalProps) => {
  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof newSetFormScheme.inputs, string>>
  >({});

  const handleDialogClose = () => {
    setIsModalOpen(false);
  };

  const handleDialogSubmit = () => {
    console.log(formValue);
    setIsModalOpen(false);
    handleNewSet(formValue);
    setFormValue({});
  };

  return (
    <Dialog
      open={isDialogOpen}
      onDialogClose={handleDialogClose}
    >
      <Modal className='w-full max-w-96'>
        <Modal.Header>
          <h6>Create new set</h6>
        </Modal.Header>

        <Modal.Body className='flex flex-col items-center justify-center pb-8 pt-4'>
          <FormComponent
            className='w-full max-w-80 text-sm'
            scheme={newSetFormScheme}
            emitFormValid={() => {}}
            emitFormValue={setFormValue}
          />
        </Modal.Body>

        <Modal.Footer className='flex items-center justify-end gap-2 py-4'>
          <Button
            label='Create'
            onClick={handleDialogSubmit}
            size={'sm'}
            variant={'primary-text'}
          ></Button>
        </Modal.Footer>
      </Modal>
    </Dialog>
  );
};

NewSetModal.displayName = 'NewSetModal';
