import { FormScheme } from '#/types/form-scheme.type';
import type { Reminder } from '#/types/reminder.type';

export const reminderScheme = (): FormScheme<Reminder> => ({
  inputs: {
    repeat: {
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
      type: 'datetime-picker',
      name: 'start',
      label: 'Start',
      required: true,
      _internal_default_value: new Date().toISOString(),
    },
  },
});
