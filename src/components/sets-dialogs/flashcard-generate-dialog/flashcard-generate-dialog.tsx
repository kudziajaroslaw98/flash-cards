import { Button } from '#/components/_ui/button/button';
import { Dialog } from '#/components/_ui/dialog/dialog';
import Modal from '#/components/_ui/modal/modal';
import FormComponent, { FormMethods } from '#/components/form-component/form';
import { cardLengthDictionary } from '#/dictionaries/card-length.dictionary';
import { knowledgeLevelDictionary } from '#/dictionaries/knowledge-level.dictionary';
import { learningStyleDictionary } from '#/dictionaries/learning-style.dictionary';
import { mnemonicPreferenceDictionary } from '#/dictionaries/mnemonic-preference.dictionary';
import { cardLengthSchema } from '#/schemas/card-length.schema';
import { knowledgeLevelSchema } from '#/schemas/knowledge-level.schema';
import { learningStyleAdaptationSchema } from '#/schemas/learning-style-adaptation.schema';
import { mnemonicPreferencesSchema } from '#/schemas/mnemonic-preferences.schema';
import { FlashcardGenerationOptions } from '#/types/flashcard-generation-options.type';
import { FormScheme } from '#/types/form-scheme.type';
import { Dot } from 'lucide-react';
import { useRef, useState } from 'react';
import { z } from 'zod';

interface FlashcardGenerateDialogProps {
  setName: string;
  setDescription: string;
  flashcardCount: number;
  handleSubmit: (value: FlashcardGenerationOptions) => Promise<void> | void;
  trigger: React.ReactNode;
  initialData?: Partial<FlashcardGenerationOptions>; // Array of initial data
}

export const FlashcardGenerateDialog = ({
  setName,
  setDescription,
  flashcardCount,
  handleSubmit,
  trigger,
  initialData = {}, // Default to an array with one empty object
}: FlashcardGenerateDialogProps) => {
  const formRef = useRef<FormMethods<FlashcardGenerationOptions>>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValue, setFormValue] = useState<
    Partial<FlashcardGenerationOptions>
  >({});
  const submitRef = useRef<HTMLButtonElement>(null);
  const initialValue = initialData;

  const getFormScheme: FormScheme<FlashcardGenerationOptions> = {
    // Schema defines the structure for EACH instance
    inputs: {
      focusAreas: {
        type: 'tags',
        label: 'Focus Areas',
        name: 'focusAreas',
        maxTags: 10,
        placeholder: 'Enter areas...',
        required: false,
        _internal_default_value: [], // Default for each new instance
        _internal_constraints: [
          {
            type: 'validation',
            key: 'focusAreas',
            constraint: z.array(z.string()).max(10, ''),
          },
        ],
      },
      knowledgeLevel: {
        type: 'dropdown',
        multiple: false,
        required: false,
        label: 'Choose level...',
        controlLabel: 'Select your knowledge level:',
        config: knowledgeLevelDictionary,
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'knowledgeLevel',
            constraint: knowledgeLevelSchema.nullish(),
          },
        ],
      },
      cardLength: {
        type: 'dropdown',
        label: 'Choose card length...',
        multiple: false,
        controlLabel: 'Card Length',
        config: cardLengthDictionary,
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'cardLength',
            constraint: cardLengthSchema.nullish(),
          },
        ],
      },
      learningStyle: {
        type: 'dropdown',
        multiple: false,
        label: 'Choose learning style...',
        controlLabel: 'Learning Style',
        config: learningStyleDictionary,
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'learningStyle',
            constraint: learningStyleAdaptationSchema.nullish(),
          },
        ],
      },
      mnemonicPreference: {
        type: 'dropdown',
        multiple: false,
        label: 'Choose mnemonic preference...',
        controlLabel: 'Mnemonic Preference',
        config: mnemonicPreferenceDictionary,
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'mnemonicPreference',
            constraint: mnemonicPreferencesSchema.nullish(),
          },
        ],
      },
      additionalUserPrompt: {
        type: 'input',
        inputType: 'text',
        label: 'Your additional prompt...',
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'additionalUserPrompt',
            constraint: z.string().max(1000, 'Max 1000 characters').nullish(),
          },
        ],
      },
    },
  };

  const handleDialogClose = () => {
    setIsModalOpen(false);
    setFormValue({});
  };

  const handleDialogSubmit = async () => {
    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      return;
    }

    const formData = formRef.current?.value;

    handleSubmit(formData);
    setIsModalOpen(false);
    setFormValue({});
  };

  return (
    <Dialog
      open={isModalOpen}
      setOpen={setIsModalOpen}
      trigger={trigger}
      onDialogClose={handleDialogClose}
      onDialogSubmit={handleDialogSubmit}
    >
      <Modal className='w-full max-w-lg'>
        <Modal.Header variant='form'>
          Set Flashcard Generating Options
        </Modal.Header>

        <Modal.Body
          variant='form'
          className='flex flex-col items-center justify-center pb-8 pt-4'
        >
          <div className='flex w-full max-w-96 flex-col p-4'>
            <h6 className='font-fredoka font-medium text-gray-600 dark:text-slate-300'>
              Also included in generation:{' '}
            </h6>

            <span className='flex items-center text-gray-600 dark:text-slate-300'>
              <Dot className='size-4 text-green-500' />
              <span>
                <span className='font-semibold'>Set name: </span>
                <span>{setName}</span>
              </span>
            </span>

            <span className='flex items-center text-gray-600 dark:text-slate-300'>
              <span className=''>
                <span className='line-clamp-3 overflow-hidden text-ellipsis'>
                  <span className='float-left mr-1 flex font-semibold'>
                    <Dot className='size-4 text-green-500' />
                    Set description:{' '}
                  </span>{' '}
                  {setDescription}
                </span>
              </span>
            </span>

            <span className='flex items-center text-gray-600 dark:text-slate-300'>
              <Dot className='size-4 text-green-500' />
              Summary of {
                flashcardCount
              } flashcards
            </span>
          </div>

          <FormComponent<FlashcardGenerationOptions>
            ref={formRef}
            className='w-full max-w-96'
            scheme={getFormScheme}
            emitFormValue={setFormValue}
            initialValues={initialValue}
          />
        </Modal.Body>

        <Modal.Footer
          variant='form'
          className='flex items-center justify-center gap-2 py-4 lg:justify-end'
        >
          <Button
            ref={submitRef}
            label='Generate Flashcards'
            onClick={handleDialogSubmit}
            size={'sm'}
            variant={'primary-text'}
            alt='Generate Flashcards'
          ></Button>
        </Modal.Footer>
      </Modal>
    </Dialog>
  );
};
