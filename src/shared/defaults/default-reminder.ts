import type { Reminder } from '#/types/reminder.type';

export const defaultReminder: Omit<Reminder, 'frontUuid' | 'setFrontUuid'> = {
  enabled: true,
  repeat: 'none',
  start: new Date().toUTCString(),
  synced: false,
  createdAt: new Date().toUTCString(),
  updatedAt: new Date().toUTCString(),
  title: '',
};
