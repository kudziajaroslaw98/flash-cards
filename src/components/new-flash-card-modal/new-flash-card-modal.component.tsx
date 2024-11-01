import { useEffect, useRef, useState } from 'react';

import { FlashCard } from '#/shared/models/flash-card.model';
import { UUID } from '#/shared/types/uuid.type';
import uuid from '#/shared/utils/uuid.util';
import { newFlashCardScheme } from '#/shared/validation-schemes/new-flash-card-validation.scheme';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface NewFlashCardModalProps {
  handleNewFlashCard: (flashCard: Partial<FlashCard>[]) => void;
  handleEditFlashCard: (editRecords: Partial<FlashCard>[]) => void;
  selectedFlashCards: FlashCard[];
  isInEditMode?: boolean;
  trigger: React.ReactNode;
}

export const NewFlashCardModal = ({
  handleNewFlashCard,
  handleEditFlashCard,
  selectedFlashCards,
  trigger,
  isInEditMode = false,
}: NewFlashCardModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<FlashCard>>({});
  const [flashCards, setFlashCards] =
    useState<Partial<FlashCard>[]>(selectedFlashCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const submitRef = useRef<HTMLButtonElement>(null);

  const clearInitialValues = () => {
    if (selectedFlashCards.length === 0) {
      setFlashCards([
        {
          frontUuid: uuid() as UUID,
          question: 'a',
          questionAddition: 'b',
          answer: 'c',
        },
      ]);
    } else {
      setFlashCards(selectedFlashCards);
    }
    setFormValue({});
  };

  useEffect(() => {
    if (selectedFlashCards.length === 0) {
      setFlashCards([
        {
          frontUuid: uuid() as UUID,
          question: 'a',
          questionAddition: 'b',
          answer: 'c',
        },
      ]);
    } else {
      setFlashCards(selectedFlashCards);
    }
  }, [selectedFlashCards]);

  useEffect(() => {
    setFlashCards((prev) =>
      prev.map((item) =>
        item.frontUuid === formValue.frontUuid ? formValue : item,
      ),
    );
  }, [formValue]);

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setCurrentIndex(0);
    clearInitialValues();
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (isInEditMode) {
      handleEditFlashCard(flashCards);
    } else {
      handleNewFlashCard(flashCards);
    }

    clearInitialValues();
    setCurrentIndex(0);
  };

  const handleRightButtonClick = () => {
    if (currentIndex < flashCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isInEditMode) {
        const newFlashCard = {
          frontUuid: uuid() as UUID,
          question: 'a' + flashCards.length,
          questionAddition: 'b' + flashCards.length,
          answer: 'c' + flashCards.length,
        };

        setFlashCards((prev) => [
          ...prev.map((item) =>
            item.frontUuid === formValue.frontUuid ? formValue : item,
          ),
          newFlashCard,
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    if (currentIndex > 0) {
      setFlashCards((prev) =>
        prev.map((item) =>
          item.frontUuid === formValue.frontUuid ? formValue : item,
        ),
      );
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTriggerClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className='w-full max-w-80 md:w-auto'
        onClick={handleTriggerClick}
      >
        {trigger}
      </div>

      <Dialog
        open={isModalOpen}
        onDialogClose={handleDialogClose}
        onDialogSubmit={handleDialogSubmit}
        handleLeftButtonClick={handleLeftButtonClick}
        handleRightButtonClick={handleRightButtonClick}
        currentIndex={currentIndex}
        maxIndex={flashCards.length}
        isInEditMode={isInEditMode}
        submitRef={submitRef}
        multiple
      >
        <Modal className='w-full'>
          <Modal.Header>
            <h6>Create new flash card</h6>
          </Modal.Header>

          <Modal.Body className='flex flex-col items-center justify-center pb-8 pt-4'>
            <FormComponent<FlashCard | Partial<FlashCard>>
              className='w-full max-w-80'
              scheme={newFlashCardScheme}
              emitFormValue={setFormValue}
              initialValues={flashCards[currentIndex]}
            />
          </Modal.Body>

          <Modal.Footer className='flex items-center justify-end gap-2 py-4'>
            <Button
              ref={submitRef}
              label={selectedFlashCards.length > 0 ? 'Edit' : 'Create'}
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
