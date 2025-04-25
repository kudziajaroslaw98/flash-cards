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
      blacklist: {
        type: 'tags', // Assuming a tags input exists for blacklist
        label: 'Exclude Topics (Blacklist)',
        name: 'blacklist',
        maxTags: 10,
        placeholder: 'Enter topics to exclude...',
        required: false,
        _internal_default_value: [],
        _internal_constraints: [
          {
            type: 'validation',
            key: 'blacklist',
            constraint: z.array(z.string()).max(10, '').nullish(),
          },
        ],
      },
      flashcardsNeeded: {
        type: 'dropdown',
        multiple: false,
        config: [
          { value: '5', label: '5' },
          { value: '10', label: '10' },
          { value: '15', label: '15' },
          { value: '20', label: '20' },
          { value: '25', label: '25' },
          {
            value: '50',
            label: '50',
          },
        ],
        controlLabel: 'How many flashcards?',
        _internal_default_value: '10',
      },
      additionalFile: {
        type: 'input',
        inputType: 'file',
        label: 'Upload PDF or Image (Max 5MB)',
        required: false,
        accept: '.pdf,image/jpeg,image/png',
        className:
          'cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-green-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-200 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-800/50',
        _internal_default_value: null,
        _internal_constraints: [
          {
            type: 'validation',
            key: 'additionalFile',
            constraint: z
              .instanceof(File)
              .refine(
                (file) =>
                  [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                  ].includes(file.type),
                {
                  message: 'Invalid document file type',
                },
              )
              .refine((file) => file.size <= 5 * 1024 * 1024, {
                message: 'File size should not exceed 5MB',
              })
              .nullish(),
          },
        ],
      },
    },
  };

  const handleDialogClose = () => {
    setIsModalOpen(false);
  };

  const handleDialogSubmit = async () => {
    await formRef.current?.checkValidity();

    if (!formRef.current?.isValid()) {
      return;
    }

    const formData = formRef.current?.value;

    handleSubmit({ ...formData });
    setIsModalOpen(false);
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
