import type { Flashcard } from '#/types/flash-card.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const newFlashcardScheme = (
  handleGenerate: () => void,
  loadingGenerate: boolean,
  isLoggedIn: boolean,
  isPlanActive: boolean,
): FormScheme<
  Pick<Flashcard, 'query' | 'context' | 'definition' | 'type'>
> => ({
  inputs: {
    type: {
      type: 'dropdown',
      value: 'index',
      name: 'type',
      controlLabel: 'Flashcard Type',
      label: 'Flashcard Type',
      config: [
        { value: 'index', label: 'Index Flashcard' },
        { value: 'question', label: 'Question with answer' },
        { value: 'single', label: 'Detailed Flashcard' },
      ],
      required: true,
    },
    context: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z
            .string()
            .includes('index')
            .or(z.string().includes('single')),
        },
        {
          type: 'validation',
          key: 'context',
          constraint: z.string().min(1, 'Word or sentence is required'),
          whenKey: 'type',
          whenConstraint: z
            .string()
            .includes('index')
            .or(z.string().includes('single')),
        },
      ],
      type: 'text',
      name: 'questionAddition',
      label: 'Word / Sentence',
      placeholder: 'Prowess',
      required: true,
    },
    query: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z
            .string()
            .includes('single')
            .or(z.string().includes('question')),
        },
        {
          type: 'prop',
          propName: 'required',
          propValue: false,
          key: 'type',
          constraint: z.string().includes('single'),
        },
        {
          type: 'prop',
          propName: 'required',
          propValue: true,
          key: 'type',
          constraint: z.string().includes('question'),
        },
        {
          type: 'validation',
          key: 'query',
          constraint: z.string().min(1, 'Question is required'),
          whenKey: 'type',
          whenConstraint: z.string().includes('question'),
        },
      ],
      type: 'textarea',
      name: 'question',
      label: 'Question',
      placeholder: 'What is the definition of word below?',
    },
    definition: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z
            .string()
            .includes('single')
            .or(z.string().includes('question')),
        },
        {
          type: 'prop',
          propName: 'required',
          propValue: true,
          key: 'type',
          constraint: z
            .string()
            .includes('single')
            .or(z.string().includes('question')),
        },
        {
          type: 'validation',
          key: 'definition',
          constraint: z.string().min(1, 'Answer is required'),
          whenKey: 'type',
          whenConstraint: z
            .string()
            .includes('question')
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
  },
});
