import { FormScheme } from '#/types/form-scheme.type';
import type { Reminder } from '#/types/reminder.type';
import { z } from 'zod';

export const reminderScheme = (): FormScheme<Reminder> => ({
  inputs: {
    title: {
      type: 'text',
      name: 'title',
      label: 'Title',
      placeholder: 'Title',
      required: false,
    },
    description: {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Description',
      required: false,
    },
    repeat: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'repeat',
          constraint: z.string().min(1, 'Repeat is required'),
        },
      ],
      type: 'dropdown',
      name: 'repeat',
      label: 'Repeat',
      controlLabel: 'Repeat',
      config: [
        {
          value: 'none',
          label: 'One time',
        },
        {
          value: 'daily',
          label: 'Daily',
        },
        {
          value: 'weekly',
          label: 'Weekly',
        },
        {
          value: 'monthly',
          label: 'Monthly',
        },
      ],
      required: true,
    },
    start: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'start',
          constraint: z.date().min(new Date(), 'Date must be in the future'),
        },
      ],
      type: 'datetime-picker',
      name: 'start',
      label: 'Start',
      required: true,
    },
  },
});
