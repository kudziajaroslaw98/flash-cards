import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSessionContext } from '#/providers/session-provider.component';
import { API_ROUTES } from '#/shared/defaults/api-routes';
import { defaultFlashcard } from '#/shared/defaults/default-flashcard';
import { flashcardsMerge } from '#/shared/helpers/flashcards-merge';
import uuid from '#/shared/utils/uuid.util';
import { newFlashcardScheme } from '#/shared/validation-schemes/new-flash-card-validation.scheme';
import type { Flashcard } from '#/types/flash-card.type';
import { useCompletion } from 'ai/react';
import { Button } from '../_ui/button/button';
import Modal from '../_ui/modal/modal';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import FormComponent, { type FormMethods } from '../form-component/form';

interface NewFlashcardModalProps {
  handleNewFlashcard: (
    flashcard: Omit<Flashcard, 'weight' | 'order'>[],
  ) => void;
  handleEditFlashcard: (editRecords: Partial<Flashcard>[]) => void;
  selectedFlashcards: Flashcard[];
  isInEditMode?: boolean;
  trigger: React.ReactNode;
}

export const NewFlashcardModal = ({
  handleNewFlashcard,
  handleEditFlashcard,
  selectedFlashcards,
  trigger,
  isInEditMode = false,
}: NewFlashcardModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<Flashcard>>({});
  const [flashcards, setFlashcards] =
    useState<Omit<Flashcard, 'order'>[]>(selectedFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const { isLoggedIn, isPlanActive } = useSessionContext();
  const submitRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<FormMethods<Omit<Flashcard, 'order'>>>(null);
  const { completion, complete } = useCompletion({
    api: API_ROUTES.ANSWER_GENERATE,
  });

  const getNewFlashcard: () => Omit<Flashcard, 'order'> = () =>
    flashcardsMerge(defaultFlashcard, {
      type: 'index' as const,
      frontUuid: uuid(),
    });

  const clearInitialValues = () => {
    if (selectedFlashcards.length === 0) {
      const newFlashcard = getNewFlashcard();
      setFlashcards([newFlashcard]);
      setFormValue(newFlashcard);
    } else {
      setFlashcards(selectedFlashcards);
      setFormValue(selectedFlashcards[0]);
    }
  };

  useEffect(() => {
    if (selectedFlashcards.length === 0) {
      setFlashcards([getNewFlashcard()]);
    } else {
      setFlashcards(selectedFlashcards);
    }
  }, [selectedFlashcards]);

  useEffect(() => {
    setFormValue(flashcards[currentIndex]);
  }, [flashcards, currentIndex]);

  useEffect(() => {
    setFormValue((prev) => ({
      ...prev,
      definition: completion,
    }));
  }, [completion]);

  const updateFormValue = () => {
    setFlashcards((prev) =>
      prev.map((item) =>
        item.frontUuid === formValue.frontUuid
          ? (formValue as Flashcard)
          : item,
      ),
    );
  };

  const handleDialogClose = () => {
    window.umami.track('Flashcard dialog - closed', { isInEditMode });

    setIsModalOpen(false);
    setCurrentIndex(0);

    clearInitialValues();
  };

  const handleDialogSubmit = async () => {
    window.umami.track('Flashcard dialog - submitted', { isInEditMode });

    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      return;
    }

    setIsModalOpen(false);

    const currentFormValue = formValue as Omit<Flashcard, 'order'>;
    const mappedFlashcards: Omit<Flashcard, 'order'>[] = flashcards.map(
      (flashcard) => {
        const item =
          flashcard.frontUuid === currentFormValue.frontUuid
            ? currentFormValue
            : flashcard;

        return {
          ...item,
          definition: item.type === 'index' ? '' : item.definition,
          query: item.type === 'index' ? '' : item.query,
          context: item.type === 'question' ? '' : item.context,
          examples: item.type === 'single' ? item.examples : '',
          keyPoints: item.type === 'single' ? item.keyPoints : '',
          relatedFacts: item.type === 'single' ? item.relatedFacts : '',
          synonyms: item.type === 'single' ? item.synonyms : '',
        };
      },
    );

    if (isInEditMode) {
      handleEditFlashcard(mappedFlashcards);
    } else {
      handleNewFlashcard(mappedFlashcards);
    }

    clearInitialValues();
    setCurrentIndex(0);
  };

  const handleRightButtonClick = () => {
    window.umami.track('Flashcard dialog - right button clicked');
    updateFormValue();
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isInEditMode) {
        setFlashcards((prev) => [...prev, getNewFlashcard()]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    window.umami.track('Flashcard dialog - left button clicked');

    if (currentIndex > 0) {
      updateFormValue();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (
      ((formValue.context !== undefined && formValue.context !== '') ||
        formValue.type === 'question') &&
      isLoggedIn &&
      isPlanActive
    ) {
      setLoadingGenerate(true);
      await complete(
        `generate ${formValue.type === 'question' ? 'answer' : 'description'} to: '${formValue.type === 'question' ? formValue.query : formValue.context}'`,
      );
      setLoadingGenerate(false);
    }
  }, [formValue, complete, isLoggedIn, isPlanActive]);

  const getFormScheme = useMemo(
    () =>
      newFlashcardScheme(
        handleGenerate,
        loadingGenerate,
        isLoggedIn,
        isPlanActive,
      ),
    [handleGenerate, loadingGenerate, isLoggedIn, isPlanActive],
  );

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
        maxIndex={flashcards.length}
        isInEditMode={isInEditMode}
        submitRef={submitRef}
      >
        <Modal className='w-full'>
          <Modal.Header variant={'form'}>
            {isInEditMode ? 'Edit flashcard' : 'Create new flashcard'}
          </Modal.Header>

          <Modal.Body
            variant={'form'}
            className='flex flex-col items-center justify-center'
          >
            <FormComponent<Flashcard | Omit<Flashcard, 'order'>>
              ref={formRef}
              className='w-full px-8'
              emitFormValue={setFormValue}
              scheme={getFormScheme}
              initialValues={formValue as Flashcard}
            />
          </Modal.Body>

          <Modal.Footer
            variant={'form'}
            className='flex items-center justify-end gap-2'
          >
            <Button
              ref={submitRef}
              label={selectedFlashcards.length > 0 ? 'Edit' : 'Create'}
              onClick={handleDialogSubmit}
              size={'sm'}
              variant={'primary-text'}
              alt='Create new flashcard'
            ></Button>
          </Modal.Footer>
        </Modal>
      </MultiDialog>
    </>
  );
};
