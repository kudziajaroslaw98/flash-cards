import type { Reminder } from '#/types/reminder.type';
import uuid from '../utils/uuid.util';

export function remindersMerge(
  defaultReminder: Omit<Reminder, 'frontUuid' | 'setFrontUuid'>,
  reminder: Partial<Reminder>,
) {
  return {
    createdAt: reminder.createdAt ?? defaultReminder.createdAt,
    description: reminder.description ?? defaultReminder.description,
    enabled: reminder.enabled ?? defaultReminder.enabled,
    frontUuid: reminder.frontUuid ?? uuid(),
    repeat: reminder.repeat ?? defaultReminder.repeat,
    setFrontUuid: reminder.setFrontUuid ?? '',
    start: reminder.start ?? defaultReminder.start,
    synced: reminder.synced ?? defaultReminder.synced,
    title: reminder.title ?? defaultReminder.title,
    updatedAt: reminder.updatedAt ?? defaultReminder.updatedAt,
  } as Reminder;
}
