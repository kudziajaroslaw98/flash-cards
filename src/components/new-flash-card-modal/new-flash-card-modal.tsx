import { useEffect, useRef, useState } from 'react';

import { newFlashCardScheme } from '#/shared/validation-schemes/new-flash-card-validation.scheme';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import { FlashCard } from '#/shared/models/flash-card.model';
import FormComponent from '../form-component/form';
import { Button } from '../_ui/button/button';
import uuid from '#/shared/utils/uuid.util';
import { UUID } from '#/types//uuid.type';
import Modal from '../_ui/modal/modal';

interface NewFlashCardModalProps {
  handleNewFlashCard: (
    flashCard: Omit<FlashCard, 'weight' | 'order'>[],
  ) => void;
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
    useState<Omit<FlashCard, 'weight' | 'order'>[]>(selectedFlashCards);
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
        item.frontUuid === formValue.frontUuid
          ? (formValue as Omit<FlashCard, 'weight' | 'order'>)
          : (item as Omit<FlashCard, 'weight' | 'order'>),
      ),
    );
  }, [formValue]);

  const handleDialogClose = () => {
    window.umami.track('Flash card dialog - closed', { isInEditMode });
    setIsModalOpen(false);
    setCurrentIndex(0);
    clearInitialValues();
  };

  const handleDialogSubmit = () => {
    window.umami.track('Flash card dialog - submitted', { isInEditMode });
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
    window.umami.track('Flash card dialog - right button clicked');
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
            item.frontUuid === formValue.frontUuid
              ? (formValue as Omit<FlashCard, 'weight' | 'order'>)
              : (item as Omit<FlashCard, 'weight' | 'order'>),
          ),
          newFlashCard,
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    window.umami.track('Flash card dialog - left button clicked');
    if (currentIndex > 0) {
      setFlashCards((prev) =>
        prev.map((item) =>
          item.frontUuid === formValue.frontUuid
            ? (formValue as Omit<FlashCard, 'weight' | 'order'>)
            : (item as Omit<FlashCard, 'weight' | 'order'>),
        ),
      );
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      <MultiDialog
        open={isModalOpen}
        setOpen={setIsModalOpen}
        trigger={trigger}
        onDialogClose={handleDialogClose}
        onDialogSubmit={handleDialogSubmit}
        handleLeftButtonClick={handleLeftButtonClick}
        handleRightButtonClick={handleRightButtonClick}
        currentIndex={currentIndex}
        maxIndex={flashCards.length}
        isInEditMode={isInEditMode}
        submitRef={submitRef}
      >
        <Modal className='w-full'>
          <Modal.Header variant={'form'}>Create new flash card</Modal.Header>

          <Modal.Body
            variant={'form'}
            className='flex flex-col items-center justify-center'
          >
            <FormComponent<FlashCard | Omit<FlashCard, 'weight' | 'order'>>
              className='w-full max-w-80'
              scheme={newFlashCardScheme}
              emitFormValue={setFormValue}
              initialValues={flashCards[currentIndex]}
            />
          </Modal.Body>

          <Modal.Footer
            variant={'form'}
            className='flex items-center justify-end gap-2'
          >
            <Button
              ref={submitRef}
              label={selectedFlashCards.length > 0 ? 'Edit' : 'Create'}
              onClick={handleDialogSubmit}
              size={'sm'}
              variant={'primary-text'}
            ></Button>
          </Modal.Footer>
        </Modal>
      </MultiDialog>
    </>
  );
};
