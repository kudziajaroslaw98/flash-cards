import { useEffect, useRef, useState } from 'react';

import uuid from '#/shared/utils/uuid.util';
import { reminderScheme } from '#/shared/validation-schemes/reminder-scheme';
import type { ModalProps } from '#/types/modal-props.type';
import type { Reminder } from '#/types/reminder.type';
import { Button } from '../_ui/button/button';
import Modal from '../_ui/modal/modal';
import { MultiDialog } from '../_ui/multi-dialog/multi-dialog';
import FormComponent, { type FormMethods } from '../form-component/form';

export function ReminderModal({
  handleNew,
  handleEdit,
  selected,
  trigger,
  isInEditMode = false,
}: ModalProps<Reminder>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<Partial<Reminder>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState<Reminder[]>(selected);
  const submitRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<FormMethods<Reminder>>(null);

  const getNewValue: () => Reminder = () => {
    return {
      enabled: true,
      frontUuid: uuid(),
      repeat: 'none',
      start: new Date(
        new Date(new Date(new Date().setMilliseconds(0)).setSeconds(0)),
      ).toUTCString(),
      synced: false,
      createdAt: new Date().toUTCString(),
      updatedAt: new Date().toUTCString(),
      title: '',
    } as Reminder;
  };

  const clearInitialValues = () => {
    if (selected.length === 0) {
      const newValue = getNewValue();
      setValues([newValue]);
      setFormValue(newValue);
    } else {
      setValues(selected);
      setFormValue(selected[0]);
    }
  };

  useEffect(() => {
    console.log(selected);
    if (selected.length === 0) {
      setValues([getNewValue()]);
    } else {
      setValues(selected);
    }
  }, [selected]);

  useEffect(() => {
    setFormValue(values[currentIndex]);
  }, [values, currentIndex]);

  const updateFormValue = () => {
    setValues((prev) => {
      const x = prev.map((item) =>
        item.frontUuid === formValue.frontUuid ? (formValue as Reminder) : item,
      );
      console.log(x);
      return x;
    });
  };

  const handleDialogClose = () => {
    window?.umami?.track('Reminder dialog - closed', { isInEditMode });

    setIsModalOpen(false);
    setCurrentIndex(0);

    clearInitialValues();
  };

  const handleDialogSubmit = async () => {
    window?.umami?.track('Reminder dialog - submitted', { isInEditMode });

    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      return;
    }

    setIsModalOpen(false);

    const currentFormValue = formValue as Reminder;
    const mappedValues: Reminder[] = values.map((value) => {
      const item =
        value.frontUuid === currentFormValue.frontUuid
          ? currentFormValue
          : value;

      return {
        ...item,
        enabled: item.enabled ?? true,
        synced: item.synced ?? false,
        repeat: item.repeat ?? 'none',
        start: item.start ?? new Date().toUTCString(),
        frontUuid: item.frontUuid ?? uuid(),
      };
    });

    if (isInEditMode) {
      handleEdit(mappedValues);
    } else {
      handleNew(mappedValues);
    }

    clearInitialValues();
    setCurrentIndex(0);
  };

  const handleRightButtonClick = () => {
    window?.umami?.track('Reminder dialog - right button clicked');
    updateFormValue();
    if (currentIndex < values.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isInEditMode) {
        setValues((prev) => [...prev, getNewValue()]);
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleLeftButtonClick = () => {
    window?.umami?.track('Reminder dialog - left button clicked');

    if (currentIndex > 0) {
      updateFormValue();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getFormScheme = reminderScheme();

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
        maxIndex={values.length}
        isInEditMode={isInEditMode}
        submitRef={submitRef}
      >
        <Modal className='w-full'>
          <Modal.Header variant={'form'}>
            {isInEditMode ? 'Edit reminder' : 'Create new reminder'}
          </Modal.Header>

          <Modal.Body
            variant={'form'}
            className='flex flex-col items-center justify-center'
          >
            <FormComponent<Reminder>
              ref={formRef}
              className='w-full px-8'
              emitFormValue={setFormValue}
              scheme={getFormScheme}
              initialValues={formValue as Reminder}
              debug={{
                inputs: true,
                values: true,
              }}
            />
          </Modal.Body>

          <Modal.Footer
            variant={'form'}
            className='flex items-center justify-end gap-2'
          >
            <Button
              type='button'
              ref={submitRef}
              label={selected.length > 0 ? 'Edit' : 'Create'}
              onClick={handleDialogSubmit}
              size={'sm'}
              variant={'primary-text'}
              alt='Create new reminder'
            ></Button>
          </Modal.Footer>
        </Modal>
      </MultiDialog>
    </>
  );
}
