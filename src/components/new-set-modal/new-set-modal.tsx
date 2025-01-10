import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSessionContext } from '#/providers/session-provider.component';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import uuid from '#/shared/utils/uuid.util';
import type { DictionaryValue } from '#/types//dictionary-value.type';
import type { FlashCardSet } from '#/types/flash-card-set.type';
import { useCompletion } from 'ai/react';
import { Button } from '../_ui/button/button';
import Modal from '../_ui/modal/modal';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import FormComponent from '../form-component/form';

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
  categories: initialCategories,
  trigger,
  selectedSets = [],
  isInEditMode = false,
  open = false,
}: NewSetModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(open);
  const [formValue, setFormValue] = useState<Partial<FlashCardSet>>({});
  const [sets, setSets] = useState<Partial<FlashCardSet>[]>(selectedSets);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const { isLoggedIn, isPlanActive } = useSessionContext();

  const { completion, complete } = useCompletion({
    api: API_ROUTES.SET_DESCRIPTION,
  });

  const submitRef = useRef<HTMLButtonElement>(null);

  const clearInitialValues = () => {
    if (selectedSets.length === 0) {
      setSets([
        {
          frontUuid: uuid(),
          name: '',
          description: '',
        },
      ]);
    } else {
      setSets(selectedSets);
    }
    setFormValue({});
  };

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (selectedSets.length === 0) {
      setSets([
        {
          frontUuid: uuid(),
          name: '',
          description: '',
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

  useEffect(() => {
    setFormValue((prev) => ({
      ...prev,
      description: completion,
    }));
  }, [completion]);

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setCurrentIndex(0);
    clearInitialValues();
  };

  const handleDialogSubmit = () => {
    setIsModalOpen(false);

    if (isInEditMode && handleEdit) {
      handleEdit(sets);
    } else if (handleNew) {
      handleNew(sets);
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
          frontUuid: uuid(),
          name: '',
          description: '',
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

  const handleGenerate = useCallback(async () => {
    if (
      formValue.name !== undefined &&
      formValue.name !== '' &&
      isLoggedIn &&
      isPlanActive
    ) {
      setLoadingGenerate(true);
      await complete(`generate description to: '${formValue.name}'`);
      setLoadingGenerate(false);
    }
  }, [formValue, complete, isLoggedIn, isPlanActive]);

  const handleAddNewCategory = useCallback((value: string) => {
    setCategories((prev) => [...prev, { value, label: value }]);
  }, []);

  const getFormScheme = useMemo(
    () =>
      newSetFormScheme(
        categories,
        handleGenerate,
        loadingGenerate,
        isLoggedIn,
        handleAddNewCategory,
        isPlanActive,
      ),
    [
      categories,
      handleGenerate,
      loadingGenerate,
      isLoggedIn,
      handleAddNewCategory,
      isPlanActive,
    ],
  );

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
          <Modal.Header variant={'form'}>Create new set</Modal.Header>
          <Modal.Body
            variant={'form'}
            className='flex flex-col items-center justify-center pb-8 pt-4'
          >
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
          <Modal.Footer
            variant={'form'}
            className='flex items-center justify-end gap-2 py-4'
          >
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
