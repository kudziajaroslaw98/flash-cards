import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { FlashCard } from '#/shared/models/flash-card.model';
import type { DictionaryValue } from '#/shared/types/dictionary-value.type';
import type { UUID } from '#/shared/types/uuid.type';
import { assignFlashCardsScheme } from '#/shared/validation-schemes/assign-flash-cards-validation.scheme';
import React, { useMemo, useRef, useState } from 'react';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface AssignFlashCardsModalProps {
  handleSubmit: (value: Array<UUID>) => void;
  flashCards: Array<FlashCard>;
  setCards: Array<UUID>;
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

  const getFormScheme = useMemo(
    () =>
      assignFlashCardsScheme(
        flashCards?.map((flashCard: FlashCard) => {
          return {
            label: flashCard?.questionAddition,
            value: flashCard?.frontUuid,
          } as DictionaryValue<UUID>;
        }, setCards),
      ),
    [flashCards, setCards],
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
        submitRef={submitRef}
      >
        <Modal className='w-full max-w-96'>
          <Modal.Header>
            <h6>Assign flash cards</h6>
          </Modal.Header>

          <Modal.Body className='flex flex-col items-center justify-center pb-8 pt-4'>
            <FormComponent<Pick<FlashCardSet, 'flashCards'>>
              className='w-full max-w-80'
              scheme={getFormScheme}
              emitFormValue={setFormValue}
              initialValues={{ flashCards: setCards }}
            />
          </Modal.Body>

          <Modal.Footer className='flex items-center justify-end gap-2 py-4'>
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
