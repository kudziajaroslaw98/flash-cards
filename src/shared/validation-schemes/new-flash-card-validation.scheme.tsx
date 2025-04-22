import type { Flashcard } from '#/types/flash-card.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const newFlashcardScheme = (
  handleGenerate: () => void,
  handleGenerateAnswers: () => void,
  loadingGenerate: boolean,
  answersLoading: boolean,
  isLoggedIn: boolean,
  isPlanActive: boolean,
): FormScheme<Omit<Flashcard, 'order'>> => ({
  inputs: {
    type: {
      type: 'dropdown',
      multiple: false,
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
          constraint: z.enum(['index', 'single'], { message: 'Required' }),
        },
        {
          type: 'validation',
          key: 'context',
          constraint: z
            .string()
            .min(1, 'Word or sentence is required')
            .max(100, 'Maximum length exceeded'),
          whenKey: 'type',
          whenConstraint: z
            .string()
            .includes('index')
            .or(z.string().includes('single')),
        },
      ],
      type: 'input',
      inputType: 'text',
      name: 'context',
      label: 'Context',
      placeholder: 'e.g., Photosynthesis, Mitochondria, "To be or not to be"',
      required: true,
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
          constraint: z.enum(['single', 'question']),
        },
        {
          type: 'validation',
          key: 'definition',
          constraint: z
            .string()
            .min(1, 'Answer is required')
            .max(500, 'Maximum length exceeded'),
          whenKey: 'type',
          whenConstraint: z
            .string()
            .includes('question')
            .or(z.string().includes('single')),
        },
        {
          type: 'prop',
          key: '_internal_show_answers',
          constraint: z.boolean().refine((value) => value === true),
          propName: 'label',
          propValue: 'Definition',
        },
      ],
      type: 'textarea',
      name: 'definition',
      label: 'Answer',
      placeholder: 'e.g., Process plants use to convert light into energy',
      handleGenerate: handleGenerate,
      loadingGenerate,
      blockGenerate: !isLoggedIn || !isPlanActive,
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
      name: 'query',
      label: 'Question',
      placeholder: 'e.g., What is the powerhouse of the cell?',
    },
    tags: {
      type: 'tags',
      name: 'tags',
      label: 'Tags',
      required: true,
      placeholder: 'e.g., Biology, Literature (press Enter/Comma)',
      _internal_constraints: [
        {
          type: 'validation',
          key: 'tags',
          constraint: z
            .array(z.string().min(1, 'Tag is required'))
            .min(1, 'At least one tag is required')
            .max(3, 'Too many tags'),
        },
      ],
    },
    _internal_separator_1: {
      type: '_internal_separator',
      name: '_internal_separator_1',
    },
    _internal_show_answers: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z.enum(['single', 'question']),
        },
      ],
      type: 'switch',
      name: '_internal_show_answers',
      label: 'Add custom answers',
      checkedLabel: 'Yes',
      uncheckedLabel: 'No',
      showLabel: true,
    },

    _internal_accordion_2: {
      _internal_constraints: [
        {
          type: 'show',
          key: '_internal_show_answers',
          constraint: z.boolean().refine((value) => value === true),
        },
      ],
      type: '_internal_accordion',
      name: '_internal_accordion_2',
      title: 'Answers',
      inputs: {
        answer1: {
          type: 'textarea',
          name: 'answer1',
          label: 'Correct Answer',
          placeholder: 'Type correct answer here',
          required: true,
          _internal_constraints: [
            {
              type: 'validation',
              key: 'answer1',
              constraint: z.string().min(1, 'Answer is required'),
              whenKey: '_internal_show_answers',
              whenConstraint: z.boolean().refine((value) => value === true),
            },
          ],
        },
        answer2: {
          type: 'textarea',
          name: 'answer2',
          label: 'Incorrect Answer 1',
          placeholder: 'Type incorrect answer here',
          required: true,
          _internal_constraints: [
            {
              type: 'validation',
              key: 'answer1',
              constraint: z.string().min(1, 'Answer is required'),
              whenKey: '_internal_show_answers',
              whenConstraint: z.boolean().refine((value) => value === true),
            },
          ],
        },
        answer3: {
          type: 'textarea',
          name: 'answer3',
          label: 'Incorrect Answer 2',
          placeholder: 'Type incorrect answer here',
          required: true,
          _internal_constraints: [
            {
              type: 'validation',
              key: 'answer1',
              constraint: z.string().min(1, 'Answer is required'),
              whenKey: '_internal_show_answers',
              whenConstraint: z.boolean().refine((value) => value === true),
            },
          ],
        },
        answer4: {
          type: 'textarea',
          name: 'answer4',
          label: 'Incorrect Answer 3',
          placeholder: 'Type incorrect answer here',
          required: false,
        },
        _internal_generate_answers: {
          name: '_internal_generate_answers',
          type: '_internal_button',
          alt: 'Generate Answers',
          label: 'Generate Answers',
          onClick: handleGenerateAnswers,
          disabled: !isLoggedIn || !isPlanActive,
          loading: answersLoading,
          size: 'full',
          className: 'mt-4 max-w-full',
          _internal_constraints: [
            {
              type: 'show',
              key: '_internal_show_answers',
              constraint: z.boolean().refine((value) => value === true),
            },
          ],
        },
      },
    },
    _internal_separator_2: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z.string().includes('single'),
        },
      ],
      type: '_internal_separator',
      name: '_internal_separator_2',
    },
    _internal_accordion_1: {
      type: '_internal_accordion',
      name: '_internal_accordion_1',
      title: 'Additional information',
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z.string().includes('single'),
        },
      ],
      inputs: {
        examples: {
          type: 'textarea',
          name: 'examples',
          label: 'Examples',
          minHeight: 98,
          placeholder:
            'e.g., The sun provides energy for photosynthesis; Mitochondria are often called the powerhouses of the cell. Separated by semicolons ( ; )',
          _internal_constraints: [
            {
              type: 'show',
              key: 'type',
              constraint: z.string().includes('single'),
            },
            {
              type: 'prop',
              propName: 'required',
              propValue: false,
              key: 'type',
              constraint: z.string().includes('single'),
            },
          ],
        },
        synonyms: {
          type: 'textarea',
          name: 'synonyms',
          label: 'Synonyms',
          minHeight: 82,
          placeholder:
            'e.g., Happy: joyful, cheerful, content; Sad: unhappy, sorrowful, dejected. Separated by semicolons ( ; )',
          _internal_constraints: [
            {
              type: 'show',
              key: 'type',
              constraint: z.string().includes('single'),
            },
            {
              type: 'prop',
              propName: 'required',
              propValue: false,
              key: 'type',
              constraint: z.string().includes('single'),
            },
          ],
        },
        keyPoints: {
          type: 'textarea',
          name: 'keyPoints',
          label: 'Key Points',
          minHeight: 98,
          placeholder:
            'e.g., Photosynthesis requires sunlight, water, and CO2; Mitochondria produce ATP through cellular respiration. Separated by semicolons ( ; )',
          _internal_constraints: [
            {
              type: 'show',
              key: 'type',
              constraint: z.string().includes('single'),
            },
            {
              type: 'prop',
              propName: 'required',
              propValue: false,
              key: 'type',
              constraint: z.string().includes('single'),
            },
          ],
        },
        relatedFacts: {
          type: 'textarea',
          name: 'relatedFacts',
          label: 'Related Facts',
          minHeight: 82,
          placeholder:
            'e.g., Chlorophyll is the pigment that captures light; Cellular respiration occurs in both plants and animals. Separated by semicolons ( ; )',
          _internal_constraints: [
            {
              type: 'show',
              key: 'type',
              constraint: z.string().includes('single'),
            },
            {
              type: 'prop',
              propName: 'required',
              propValue: false,
              key: 'type',
              constraint: z.string().includes('single'),
            },
          ],
        },
      },
    },
  },
});
