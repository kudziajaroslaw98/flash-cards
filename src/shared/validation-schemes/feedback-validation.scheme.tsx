import { feedbackTypeSchema } from '#/schemas/feedback-type.schema';
import { type Feedback } from '#/types/feedback.type';
import type { FormScheme } from '#/types/form-scheme.type';
import { z } from 'zod';

export const feedbackFormScheme: FormScheme<Feedback> = {
  inputs: {
    feedbackType: {
      type: 'dropdown',
      multiple: false,
      label: 'Feedback Type',
      controlLabel: 'What kind of feedback is this?',
      config: [
        { value: 'bug', label: 'Bug Report' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'general', label: 'General Feedback' },
        { value: 'other', label: 'Other' },
      ],
      required: true,
      _internal_default_value: 'general',
      _internal_constraints: [
        {
          type: 'validation',
          key: 'feedbackType',
          constraint: feedbackTypeSchema,
        },
      ],
    },
    subject: {
      type: 'input',
      inputType: 'text',
      name: 'subject',
      label: 'Subject',
      placeholder: 'e.g., Issue with saving flashcards',
      required: true,
      _internal_constraints: [
        {
          type: 'validation',
          key: 'subject',
          constraint: z.string().min(3).max(100),
        },
      ],
    },
    description: {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Please describe your feedback in detail...',
      required: true,
      _internal_constraints: [
        {
          type: 'validation',
          key: 'description',
          constraint: z.string().min(10).max(1000),
        },
      ],
    },
  },
};
