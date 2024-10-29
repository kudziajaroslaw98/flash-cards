import { FlashCardSet } from '#/shared/models/flash-card-set.model';
import { FlashCard } from '#/shared/models/flash-card.model';
import { DictionaryValue } from '#/shared/types/dictionary-value.type';
import { UUID } from '#/shared/types/uuid.type';
import { assignFlashCardsScheme } from '#/shared/validation-schemes/assign-flash-cards-validation.scheme';
import { useEffect, useMemo, useState } from 'react';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface AssignFlashCardsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  handleSubmit: (value: Array<UUID>) => void;
  flashCards: Array<FlashCard>;
  setCards: Array<UUID>;
}

export const AssignFlashCardsModal = ({
  isModalOpen,
  setIsModalOpen,
  handleSubmit,
  flashCards = [],
  setCards = [],
}: AssignFlashCardsModalProps) => {
  const [formValue, setFormValue] = useState<Partial<FlashCardSet>>({
    flashCards: [],
  });
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

  useEffect(() => {
    console.log(flashCards);
    console.log(
      assignFlashCardsScheme(
        flashCards?.map((flashCard: FlashCard) => {
          return {
            label: flashCard?.questionAddition,
            value: flashCard?.frontUuid,
          } as DictionaryValue<UUID>;
        }),
      ),
    );
  }, [flashCards, setCards]);

  const handleDialogClose = () => {
    setIsModalOpen(false);
  };

  const handleDialogSubmit = () => {
    console.log(formValue?.flashCards ?? []);

    setIsModalOpen(false);
    handleSubmit(formValue?.flashCards ?? []);
    setFormValue({ flashCards: [] });
  };

  return (
    <Dialog
      open={isModalOpen}
      onDialogClose={handleDialogClose}
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
            debug={{
              errors: true,
              inputs: true,
              values: true,
            }}
          />
        </Modal.Body>

        <Modal.Footer className='flex items-center justify-end gap-2 py-4'>
          <Button
            label='Assign'
            onClick={handleDialogSubmit}
            size={'sm'}
            variant={'primary-text'}
          ></Button>
        </Modal.Footer>
      </Modal>
    </Dialog>
  );
};
