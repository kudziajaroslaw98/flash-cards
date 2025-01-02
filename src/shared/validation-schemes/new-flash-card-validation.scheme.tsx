import type { FlashCard } from '#/types/flash-card.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const newFlashCardValidationScheme = z.object({
  flashCardType: z.string().min(1, 'Flash Card Type is required'),
  question: z.string().optional(),
  questionAddition: z
    .string()
    .min(1, 'Word or sentence is required')
    .optional(),
  answer: z.string().max(255, 'Answer is too long').optional(),
});

export const newFlashCardScheme = (
  handleGenerate: () => void,
  loadingGenerate: boolean,
  isLoggedIn: boolean,
  isPlanActive: boolean,
): FormScheme<
  Pick<FlashCard, 'question' | 'questionAddition' | 'answer' | 'flashCardType'>
> => ({
  inputs: {
    flashCardType: {
      type: 'dropdown',
      value: 'index',
      name: 'flashCardType',
      controlLabel: 'Flash Card Type',
      label: 'Flash Card Type',
      config: [
        { value: 'index', label: 'Index Flash Card' },
        { value: 'single', label: 'Single answer' },
        { value: 'multiple', label: 'Multiple answers' },
      ],
      required: true,
    },
    questionAddition: {
      type: 'text',
      name: 'questionAddition',
      label: 'Word / Sentence',
      placeholder: 'Prowess',
      required: true,
    },
    answer: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'flashCardType',
          constraint: z
            .string()
            .includes('single')
            .or(z.string().includes('multiple')),
        },
        {
          type: 'prop',
          propName: 'required',
          propValue: true,
          key: 'flashCardType',
          constraint: z
            .string()
            .includes('single')
            .or(z.string().includes('multiple')),
        },
      ],
      type: 'textarea',
      name: 'answer',
      label: 'Answer',
      placeholder: 'Military valor and skill.',
      handleGenerate: handleGenerate,
      loadingGenerate,
      blockGenerate: !isLoggedIn || !isPlanActive,
    },
    question: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'flashCardType',
          constraint: z.string().includes('single'),
        },
        {
          type: 'prop',
          propName: 'required',
          propValue: false,
          key: 'flashCardType',
          constraint: z.string().includes('single'),
        },
      ],
      type: 'text',
      name: 'question',
      label: 'Question',
      placeholder: 'What is the definition of word below?',
    },
  },
  validation: newFlashCardValidationScheme,
});
