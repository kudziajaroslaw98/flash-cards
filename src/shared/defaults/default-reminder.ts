import type { Reminder } from '#/types/reminder.type';

export const defaultReminder: Omit<Reminder, 'frontUuid' | 'setFrontUuid'> = {
  enabled: true,
  repeat: 'none',
  start: new Date().toISOString(),
  synced: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  title: '',
};
