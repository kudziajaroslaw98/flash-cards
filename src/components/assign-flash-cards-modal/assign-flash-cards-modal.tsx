import { assignFlashCardsScheme } from '#/shared/validation-schemes/assign-flash-cards-validation.scheme';
import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { FlashCard } from '#/shared/models/flash-card.model';
import React, { useMemo, useRef, useState } from 'react';
import FormComponent from '../form-component/form';
import { Button } from '../_ui/button/button';
import { Dialog } from '../_ui/dialog/dialog';
import Modal from '../_ui/modal/modal';

interface AssignFlashCardsModalProps {
  handleSubmit: (value: FlashCard[]) => void;
  flashCards: FlashCard[];
  setCards: FlashCard[];
  trigger: React.ReactNode;
}

export const AssignFlashCardsModal = ({
  handleSubmit,
  flashCards = [],
  setCards = [],
  trigger,
}: AssignFlashCardsModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<FlashCardSet>>({
    flashCards: [],
  });

  const submitRef = useRef<HTMLButtonElement>(null);
  const initialValue = { flashCards: setCards };

  const getFormScheme = useMemo(
    () =>
      assignFlashCardsScheme(
        flashCards?.map((flashCard) => ({
          label: flashCard?.questionAddition,
          value: flashCard,
        })),
      ),
    [flashCards],
  );

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setFormValue({ flashCards: [] });
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    handleSubmit(formValue?.flashCards ?? []);
    setFormValue({ flashCards: [] });
  };

  return (
    <>
      <Dialog
        open={isModalOpen}
        setOpen={setIsModalOpen}
        trigger={trigger}
        onDialogClose={handleDialogClose}
        onDialogSubmit={handleDialogSubmit}
        submitRef={submitRef}
      >
        <Modal className='w-full max-w-96'>
          <Modal.Header variant='form'>Assign flash cards</Modal.Header>

          <Modal.Body
            variant='form'
            className='flex flex-col items-center justify-center pb-8 pt-4'
          >
            <FormComponent<Pick<FlashCardSet, 'flashCards'>>
              className='w-full max-w-80'
              scheme={getFormScheme}
              emitFormValue={setFormValue}
              initialValues={initialValue}
            />
          </Modal.Body>

          <Modal.Footer
            variant='form'
            className='flex items-center justify-end gap-2 py-4'
          >
            <Button
              ref={submitRef}
              label='Assign'
              onClick={handleDialogSubmit}
              size={'sm'}
              variant={'primary-text'}
            ></Button>
          </Modal.Footer>
        </Modal>
      </Dialog>
    </>
  );
};
