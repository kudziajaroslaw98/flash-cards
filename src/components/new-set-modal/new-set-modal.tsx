import { newSetFormScheme } from '#/shared/validation-schemes/new-set-validation.scheme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSessionContext } from '#/providers/session-provider.component';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import uuid from '#/shared/utils/uuid.util';
import type { DictionaryValue } from '#/types//dictionary-value.type';
import type { FlashcardSet } from '#/types/flash-card-set.type';
import { useCompletion } from 'ai/react';
import { Button } from '../_ui/button/button';
import Modal from '../_ui/modal/modal';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import FormComponent, { type FormMethods } from '../form-component/form';

interface NewSetModalProps {
  handleNew?: (sets: Partial<FlashcardSet>[]) => void;
  handleEdit?: (sets: Partial<FlashcardSet>[]) => void;
  categories: DictionaryValue<string>[];
  selectedSets: FlashcardSet[];
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
  const [formValue, setFormValue] = useState<Partial<FlashcardSet>>({});
  const [sets, setSets] = useState<Partial<FlashcardSet>[]>(selectedSets);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [categories, setCategories] = useState<DictionaryValue<string>[]>([]);
  const { isLoggedIn, isPlanActive } = useSessionContext();
  const formRef =
    useRef<
      FormMethods<Pick<FlashcardSet, 'description' | 'name' | 'category'>>
    >(null);

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
    setIsModalOpen(open);
  }, [open]);

  useEffect(() => {
    setFormValue(sets[currentIndex]);
  }, [currentIndex, sets]);

  useEffect(() => {
    setFormValue((prev) => ({
      ...prev,
      description: completion,
    }));
  }, [completion]);

  const updateFormValue = () => {
    setSets((prev) =>
      prev.map((item) =>
        item.frontUuid === formValue.frontUuid ? formValue : item,
      ),
    );
  };

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setCurrentIndex(0);
    clearInitialValues();
  };

  const handleDialogSubmit = async () => {
    window?.umami?.track('Flashcard set dialog - submitted', { isInEditMode });

    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      return;
    }

    setIsModalOpen(false);

    const currentFormValue = formValue;

    const mappedSets = sets.map((set) =>
      set.frontUuid === currentFormValue.frontUuid ? currentFormValue : set,
    );

    if (isInEditMode && handleEdit) {
      handleEdit(mappedSets);
    } else if (handleNew) {
      handleNew(mappedSets);
    }

    clearInitialValues();
    setCurrentIndex(0);
  };

  const handleRightButtonClick = () => {
    window?.umami?.track('Flashcard set dialog - right button clicked');
    updateFormValue();
    if (currentIndex < sets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isInEditMode) {
        const newSet: Partial<FlashcardSet> = {
          frontUuid: uuid(),
          name: '',
          description: '',
        };

        setSets((prev) => [...prev, newSet]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    window?.umami?.track('Flashcard set dialog - left button clicked');

    if (currentIndex > 0) {
      updateFormValue();
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
      await complete(
        `generate description to: '${formValue.name}' around 240 characters`,
      );
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
              | Pick<FlashcardSet, 'name' | 'description' | 'category'>
              | Partial<FlashcardSet>
            >
              ref={formRef}
              className='w-full max-w-80'
              scheme={getFormScheme}
              emitFormValue={setFormValue}
              initialValues={formValue}
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
              alt='Submit button'
            ></Button>
          </Modal.Footer>
        </Modal>
      </MultiDialog>
    </>
  );
};

NewSetModal.displayName = 'NewSetModal';
