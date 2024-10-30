import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { useEffect, useMemo, useState } from 'react';

import { FlashCardSet } from '#/shared/models/flash-card-set.model';
import { DictionaryValue } from '#/shared/types/dictionary-value.type';
import { UUID } from '#/shared/types/uuid.type';
import uuid from '#/shared/utils/uuid.util';
import FormComponent from '../form-component/form.component';
import { Button } from '../ui/button/button.component';
import Dialog from '../ui/dialog/dialog.component';
import Modal from '../ui/modal/modal.component';

interface NewSetModalProps {
  handleNew?: (sets: Partial<FlashCardSet>[]) => void;
  handleEdit?: (sets: Partial<FlashCardSet>[]) => void;
  categories: DictionaryValue<string>[];
  selectedSets: FlashCardSet[];
  isInEditMode?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  multiple?: boolean;
}

export const NewSetModal = ({
  handleNew,
  handleEdit,
  categories,
  trigger,
  selectedSets = [],
  multiple = false,
  isInEditMode = false,
  open = false,
}: NewSetModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<FlashCardSet>>({});
  const [sets, setSets] = useState<Partial<FlashCardSet>[]>(selectedSets);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (selectedSets.length === 0) {
      setSets([
        {
          frontUuid: uuid() as UUID,
          name: 'a',
          description: 'b',
        },
      ]);
    } else {
      setSets(selectedSets);
    }
  }, [selectedSets]);

  useEffect(() => {
    setIsModalOpen(open);
  }, [open]);

  useEffect(() => {
    setSets((prev) =>
      prev.map((item) =>
        item.frontUuid === formValue.frontUuid ? formValue : item,
      ),
    );
  }, [formValue]);

  const getFormScheme = useMemo(
    () => newSetFormScheme(categories),
    [categories],
  );

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setCurrentIndex(0);
    setFormValue({});
    setSets(selectedSets);
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (isInEditMode) {
      handleEdit && handleEdit(sets);
    } else {
      handleNew && handleNew(sets);
    }

    setFormValue({});
    setCurrentIndex(0);
    setSets(selectedSets);
  };

  const handleRightButtonClick = () => {
    if (currentIndex < sets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isInEditMode) {
        const newSet: Partial<FlashCardSet> = {
          frontUuid: uuid() as UUID,
          name: 'a' + sets.length,
          description: 'b' + sets.length,
        };

        setSets((prev) => [
          ...prev.map((item) =>
            item.frontUuid === formValue.frontUuid ? formValue : item,
          ),
          newSet,
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    if (currentIndex > 0) {
      setSets((prev) =>
        prev.map((item) =>
          item.frontUuid === formValue.frontUuid ? formValue : item,
        ),
      );
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      <div onClick={() => setIsModalOpen(true)}>{trigger}</div>

      <Dialog
        open={isModalOpen}
        onDialogClose={handleDialogClose}
        isInEditMode={isInEditMode}
        currentIndex={currentIndex}
        maxIndex={sets.length}
        handleLeftButtonClick={handleLeftButtonClick}
        handleRightButtonClick={handleRightButtonClick}
        multiple={multiple}
      >
        <Modal className='w-full'>
          <Modal.Header>
            <h6>Create new set</h6>
          </Modal.Header>
          <Modal.Body className='flex flex-col items-center justify-center pb-8 pt-4'>
            <FormComponent<
              | Pick<FlashCardSet, 'name' | 'description' | 'category'>
              | Partial<FlashCardSet>
            >
              className='w-full max-w-80'
              scheme={getFormScheme}
              emitFormValue={setFormValue}
              initialValues={sets[currentIndex]}
            />
          </Modal.Body>
          <Modal.Footer className='flex items-center justify-end gap-2 py-4'>
            <Button
              label={isInEditMode ? 'Update' : 'Create'}
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

NewSetModal.displayName = 'NewSetModal';
