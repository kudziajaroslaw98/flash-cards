import { z } from 'zod';

export const newFlashCardValidationScheme = z.object({
  question: z.string().min(1, 'Question is required'),
  questionAddition: z.string().min(1, 'Addition is required'),
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(255, 'Answer is too long'),
});

export const newFlashCardScheme = {
  inputs: {
    question: {
      type: 'text',
      name: 'question',
      label: 'Question',
      placeholder: 'What is the definition of word below?',
    },
    questionAddition: {
      type: 'text',
      name: 'questionAddition',
      label: 'Addition',
      placeholder: 'Prowess',
    },
    answer: {
      type: 'textarea',
      name: 'answer',
      label: 'Answer',
      placeholder: 'Military valor and skill.',
    },
  },
  validation: newFlashCardValidationScheme,
};
