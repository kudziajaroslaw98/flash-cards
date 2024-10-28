import { useEffect, useState } from 'react';

import useKeyPress from '#/hooks/use-key-press.hook';
import { FlashCard } from '#/shared/models/flash-card.model';
import { UUID } from '#/shared/types/uuid.type';
import uuid from '#/shared/utils/uuid.util';
import { newFlashCardScheme } from '#/shared/validation-schemes/new-flash-card-validation.scheme';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface NewFlashCardModalProps {
  isDialogOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewFlashCard: (flashCard: Partial<FlashCard>[]) => void;
  handleEditFlashCard: (editRecords: Partial<FlashCard>[]) => void;
  selectedFlashCards: FlashCard[];
  isInEditMode?: boolean;
}

export const NewFlashCardModal = ({
  isDialogOpen,
  setIsModalOpen,
  handleNewFlashCard,
  handleEditFlashCard,
  selectedFlashCards,
  isInEditMode = false,
}: NewFlashCardModalProps) => {
  const [formValue, setFormValue] = useState<Partial<FlashCard>>({});
  const [flashCards, setFlashCards] =
    useState<Partial<FlashCard>[]>(selectedFlashCards);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setFormValue({});
    setFlashCards(selectedFlashCards);
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (isInEditMode) {
      handleEditFlashCard(flashCards);
    } else {
      handleNewFlashCard(flashCards);
    }

    setFormValue({});
    setCurrentIndex(0);
    setFlashCards(selectedFlashCards);
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

  useKeyPress(['ArrowRight'], handleRightButtonClick);
  useKeyPress(['ArrowLeft'], handleLeftButtonClick);

  return (
    <Dialog
      open={isDialogOpen}
      onDialogClose={handleDialogClose}
    >
      <Button
        size='icon'
        variant={currentIndex === 0 ? 'disabled-fill' : 'primary'}
        disabled={currentIndex === 0}
        icon={<ArrowLeftIcon className='h-4 w-4' />}
        className='hidden md:flex'
        onClick={handleLeftButtonClick}
      />

      <div className='flex w-full max-w-96 flex-col items-center justify-center gap-4'>
        <AnimatePresence mode='popLayout'>
          <motion.div
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, translateY: -100 }}
            key={currentIndex + '1'}
            className='w-full'
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
                  label={selectedFlashCards.length > 0 ? 'Edit' : 'Create'}
                  onClick={handleDialogSubmit}
                  size={'sm'}
                  variant={'primary-text'}
                ></Button>
              </Modal.Footer>
            </Modal>
          </motion.div>
        </AnimatePresence>

        <div className='flex w-full items-center gap-4 md:hidden'>
          <Button
            size='icon'
            variant={currentIndex === 0 ? 'disabled-fill' : 'primary'}
            disabled={currentIndex === 0}
            icon={<ArrowLeftIcon className='h-4 w-4' />}
            onClick={handleLeftButtonClick}
          />

          <Button
            size='icon'
            variant={
              currentIndex >= flashCards.length - 1 && isInEditMode
                ? 'disabled-fill'
                : 'primary'
            }
            disabled={currentIndex >= flashCards.length - 1 && isInEditMode}
            icon={
              currentIndex === flashCards.length - 1 && !isInEditMode ? (
                <PlusIcon className='h-4 w-4' />
              ) : (
                <ArrowRightIcon className='h-4 w-4' />
              )
            }
            onClick={handleRightButtonClick}
          />
        </div>

        <div className='text-sm text-gray-200'>
          {currentIndex + 1} | {flashCards.length}
        </div>
      </div>

      <Button
        size='icon'
        variant={
          currentIndex >= flashCards.length - 1 && isInEditMode
            ? 'disabled-fill'
            : 'primary'
        }
        disabled={currentIndex >= flashCards.length - 1 && isInEditMode}
        icon={
          currentIndex === flashCards.length - 1 && !isInEditMode ? (
            <PlusIcon className='h-4 w-4' />
          ) : (
            <ArrowRightIcon className='h-4 w-4' />
          )
        }
        className='hidden md:flex'
        onClick={handleRightButtonClick}
      />
    </Dialog>
  );
};
