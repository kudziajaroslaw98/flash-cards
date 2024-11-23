import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { FlashCardSet } from '#/shared/models/flash-card-set.model';
import type { DictionaryValue } from '#/types//dictionary-value.type';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import FormComponent from '../form-component/form';
import type { UUID } from '#/types//uuid.type';
import { Button } from '../_ui/button/button';
import uuid from '#/shared/utils/uuid.util';
import Modal from '../_ui/modal/modal';

interface NewSetModalProps {
  handleNew?: (sets: Partial<FlashCardSet>[]) => void;
  handleEdit?: (sets: Partial<FlashCardSet>[]) => void;
  categories: DictionaryValue<string>[];
  selectedSets: FlashCardSet[];
  isInEditMode?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
}

export const NewSetModal = ({
  handleNew,
  handleEdit,
  categories,
  trigger,
  selectedSets = [],
  isInEditMode = false,
  open = false,
}: NewSetModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(open);
  const [formValue, setFormValue] = useState<Partial<FlashCardSet>>({});
  const [sets, setSets] = useState<Partial<FlashCardSet>[]>(selectedSets);
  const [currentIndex, setCurrentIndex] = useState(0);

  const submitRef = useRef<HTMLButtonElement>(null);

  const clearInitialValues = () => {
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
    setFormValue({});
  };

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
    setSets((prev) =>
      prev.map((item) =>
        item.frontUuid === formValue.frontUuid ? formValue : item,
      ),
    );
  }, [formValue]);

  useEffect(() => {
    setIsModalOpen(open);
  }, [open]);

  const getFormScheme = useMemo(
    () => newSetFormScheme(categories),
    [categories],
  );

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setCurrentIndex(0);
    clearInitialValues();
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (isInEditMode) {
      handleEdit && handleEdit(sets);
    } else {
      handleNew && handleNew(sets);
    }

    clearInitialValues();
    setCurrentIndex(0);
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
      <MultiDialog
        open={isModalOpen}
        setOpen={setIsModalOpen}
        trigger={trigger}
        onDialogClose={handleDialogClose}
        onDialogSubmit={handleDialogSubmit}
        isInEditMode={isInEditMode}
        currentIndex={currentIndex}
        maxIndex={sets.length}
        handleLeftButtonClick={handleLeftButtonClick}
        handleRightButtonClick={handleRightButtonClick}
      >
        <Modal className='w-full'>
          <Modal.Header>Create new set</Modal.Header>
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
              ref={submitRef}
              label={isInEditMode ? 'Update' : 'Create'}
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

NewSetModal.displayName = 'NewSetModal';
