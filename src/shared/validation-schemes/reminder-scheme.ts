import type { FormScheme } from '#/types/form-scheme.type';
import type { Reminder } from '#/types/reminder.type';
import { z } from 'zod';

export const reminderScheme = (): FormScheme<Reminder> => ({
  inputs: {
    title: {
      _internal_constraints: [
        {
          type: 'validation',
          key: 'title',
          constraint: z.string().min(1, 'Title is required'),
        },
      ],
      type: 'input',
      inputType: 'text',
      name: 'title',
      label: 'Title',
      placeholder: 'Title',
      required: true,
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
      multiple: false,
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
    enabled: {
      type: 'switch',
      name: 'enabled',
      label: 'Activate reminder',
      showLabel: true,
      checkedLabel: 'Active',
      uncheckedLabel: 'Inactive',
      variant: 'vertical-reversed',
      required: true,
      _internal_constraints: [
        {
          type: 'validation',
          key: 'enabled',
          constraint: z.boolean(),
        },
      ],
    },
    start: {
      _internal_constraints: [
        {
          type: 'show',
          key: 'enabled',
          constraint: z.boolean().refine((value) => value, 'Required'),
        },
        {
          type: 'validation',
          key: 'start',
          constraint: z
            .string()
            .min(1, 'Start is required')
            .transform((value) => new Date(value))
            .refine(
              (date) => date instanceof Date && !isNaN(date.getTime()),
              'Invalid date format',
            )
            .refine((date) => date > new Date(), 'Date must be in the future'),
        },
      ],
      type: 'datetime-picker',
      name: 'start',
      label: 'Start',
      required: true,
    },
  },
});
