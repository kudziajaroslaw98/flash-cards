import { assignFlashcardsScheme } from '#/shared/validation-schemes/assign-flash-cards-validation.scheme';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import type { Flashcard } from '#/types/flash-card.type';
import React, { useMemo, useRef, useState } from 'react';
import { Button } from '../_ui/button/button';
import { Dialog } from '../_ui/dialog/dialog';
import Modal from '../_ui/modal/modal';
import FormComponent from '../form-component/form';

interface AssignFlashcardsModalProps {
  handleSubmit: (value: string[]) => void;
  flashcards: Flashcard[];
  setCards: string[];
  trigger: React.ReactNode;
}

export const AssignFlashcardsModal = ({
  handleSubmit,
  flashcards = [],
  setCards = [],
  trigger,
}: AssignFlashcardsModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<FlashcardSet>>({
    flashcards: [],
  });

  const submitRef = useRef<HTMLButtonElement>(null);
  const initialValue = { flashcards: setCards };

  const getFormScheme = useMemo(
    () =>
      assignFlashcardsScheme(
        flashcards?.map((flashcard) => {
          if (flashcard.type === 'index' || flashcard.type === 'single') {
            return {
              label:
                flashcard.query !== '' ? flashcard.query! : flashcard.context!,
              value: flashcard.frontUuid,
            };
          }
          return {
            label: flashcard.query,
            value: flashcard.frontUuid,
          };
        }),
      ),
    [flashcards],
  );

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setFormValue({ flashcards: [] });
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (!formValue?.flashcards?.length) {
      handleSubmit([]);
    } else {
      const mappedFlashcards = flashcards
        .filter((flashcard) =>
          formValue?.flashcards?.includes(flashcard.frontUuid),
        )
        .map((flashcard) => flashcard.frontUuid);
      handleSubmit(mappedFlashcards);
    }

    setFormValue({ flashcards: [] });
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
          <Modal.Header variant='form'>Assign flashcards</Modal.Header>

          <Modal.Body
            variant='form'
            className='flex flex-col items-center justify-center pb-8 pt-4'
          >
            <FormComponent<Pick<FlashcardSet, 'flashcards'>>
              className='w-full max-w-96'
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
              alt='Assign flashcards'
            ></Button>
          </Modal.Footer>
        </Modal>
      </Dialog>
    </>
  );
};
