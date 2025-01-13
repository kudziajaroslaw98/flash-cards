import { assignFlashCardsScheme } from '#/shared/validation-schemes/assign-flash-cards-validation.scheme';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import type { FlashCard } from '#/types/flash-card.type';
import React, { useMemo, useRef, useState } from 'react';
import { Button } from '../_ui/button/button';
import { Dialog } from '../_ui/dialog/dialog';
import Modal from '../_ui/modal/modal';
import FormComponent from '../form-component/form';

interface AssignFlashCardsModalProps {
  handleSubmit: (value: string[]) => void;
  flashCards: FlashCard[];
  setCards: string[];
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
        flashCards?.map((flashCard) => {
          if (flashCard.type === 'index' || flashCard.type === 'single') {
            return {
              label: flashCard.questionAddition,
              value: flashCard.frontUuid,
            };
          }
          return {
            label: flashCard.question,
            value: flashCard.frontUuid,
          };
        }),
      ),
    [flashCards],
  );

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setFormValue({ flashCards: [] });
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (!formValue?.flashCards?.length) {
      handleSubmit([]);
    } else {
      const mappedFlashCards = flashCards
        .filter((flashCard) =>
          formValue?.flashCards?.includes(flashCard.frontUuid),
        )
        .map((flashCard) => flashCard.frontUuid);
      handleSubmit(mappedFlashCards);
    }

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
