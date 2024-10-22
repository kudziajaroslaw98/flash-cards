import { useState } from 'react';

import { FlashCard } from '#/shared/models/flash-card.model';
import { newFlashCardScheme } from '#/shared/validation-schemes/new-flash-card-validation.scheme';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface NewFlashCardModalProps {
  isDialogOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewFlashCard: (
    flashCard: Record<keyof typeof newFlashCardScheme.inputs, string>,
  ) => void;
  selectedFlashCards: FlashCard[];
}

export const NewFlashCardModal = ({
  isDialogOpen,
  setIsModalOpen,
  handleNewFlashCard,
  selectedFlashCards,
}: NewFlashCardModalProps) => {
  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof newFlashCardScheme.inputs, string>>
  >({});

  const handleDialogClose = () => {
    setIsModalOpen(false);
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);
    handleNewFlashCard(
      formValue as Record<keyof typeof newFlashCardScheme.inputs, string>,
    );
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
            className='w-full max-w-80'
            scheme={newFlashCardScheme}
            emitFormValid={() => {}}
            emitFormValue={setFormValue}
            initialValues={
              (selectedFlashCards.length > 0 && {
                word: selectedFlashCards[0].word,
                definition: selectedFlashCards[0].definition,
              }) ||
              {}
            }
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

NewFlashCardModal.displayName = 'NewFlashCardModal';
