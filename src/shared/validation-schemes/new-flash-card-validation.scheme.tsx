import type { Flashcard } from '#/types/flash-card.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const newFlashcardScheme = (
  handleGenerate: () => void,
  loadingGenerate: boolean,
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
          constraint: z.string().min(1, 'Word or sentence is required'),
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
      placeholder: 'Prowess',
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
            .or(z.string().includes('single')),
        },
      ],
      type: 'textarea',
      name: 'definition',
      label: 'Answer',
      placeholder: 'Military valor and skill.',
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
      placeholder: 'What is the definition of word below?',
    },
    tags: {
      type: 'tags',
      name: 'tags',
      label: 'Tags',
      required: true,
      placeholder: 'Add tags by pressing enter or coma',
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
    _internal_showAnswers: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'type',
          constraint: z.string().includes('single'),
        },
      ],
      type: 'switch',
      name: '_internal_showAnswers',
      label: 'Add custom answers',
      checkedLabel: 'Yes',
      uncheckedLabel: 'No',
      showLabel: true,
    },

    _internal_accordion_2: {
      _internal_constraints: [
        {
          type: 'show',
          key: '_internal_showAnswers',
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
              whenKey: '_internal_showAnswers',
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
              whenKey: '_internal_showAnswers',
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
              whenKey: '_internal_showAnswers',
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
          placeholder:
            'Enter examples of usage of the term, separated by semicolons ( ; )',
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
          placeholder:
            'Enter synonyms to the term, separated by semicolons ( ; )',
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
          placeholder:
            'Enter key points about the term, separated by semicolons ( ; )',
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
          placeholder:
            'Enter related facts about the term, separated by semicolons ( ; )',
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
    // examples: {
    //   type: 'textarea',
    //   name: 'examples',
    //   label: 'Examples',
    //   placeholder:
    //     'Enter examples of usage of the term, separated by semicolons ( ; )',
    //   _internal_constraints: [
    //     {
    //       type: 'show',
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //     {
    //       type: 'prop',
    //       propName: 'required',
    //       propValue: false,
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //   ],
    // },
    // synonyms: {
    //   type: 'textarea',
    //   name: 'synonyms',
    //   label: 'Synonyms',
    //   placeholder: 'Enter synonyms to the term, separated by semicolons ( ; )',
    //   _internal_constraints: [
    //     {
    //       type: 'show',
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //     {
    //       type: 'prop',
    //       propName: 'required',
    //       propValue: false,
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //   ],
    // },
    // keyPoints: {
    //   type: 'textarea',
    //   name: 'keyPoints',
    //   label: 'Key Points',
    //   placeholder:
    //     'Enter key points about the term, separated by semicolons ( ; )',
    //   _internal_constraints: [
    //     {
    //       type: 'show',
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //     {
    //       type: 'prop',
    //       propName: 'required',
    //       propValue: false,
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //   ],
    // },
    // relatedFacts: {
    //   type: 'textarea',
    //   name: 'relatedFacts',
    //   label: 'Related Facts',
    //   placeholder:
    //     'Enter related facts about the term, separated by semicolons ( ; )',
    //   _internal_constraints: [
    //     {
    //       type: 'show',
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //     {
    //       type: 'prop',
    //       propName: 'required',
    //       propValue: false,
    //       key: 'type',
    //       constraint: z.string().includes('single'),
    //     },
    //   ],
    // },
  },
});
