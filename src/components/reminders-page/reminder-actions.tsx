import { db } from '#/db/dexie.db';
import { useAppContext } from '#/providers/app-context';
import type { Reminder } from '#/types/reminder.type';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Plus, Trash } from 'lucide-react';
import { AlertDialog } from '../_ui/alert-dialog/alert-dialog';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ReminderModal } from '../reminder-modal/reminder-modal';

export function ReminderActions({
  selected,
  setSelected,
}: {
  selected: Reminder[];
  setSelected: React.Dispatch<React.SetStateAction<Reminder[]>>;
}) {
  const { reminders, addReminders, updateReminders, removeReminders } =
    useAppContext();

  const updatedSelected =
    useLiveQuery(
      () =>
        db.reminders
          .where('frontUuid')
          .anyOf(selected.map((f) => f.frontUuid))
          .toArray(),
      [selected],
    ) ?? [];

  const handleEditRecords = (editRecords: Partial<Reminder>[]) => {
    updateReminders(editRecords);
  };
  const handleNewRecords = (values: Reminder[]) => {
    addReminders(values);

    setTimeout(() => {
      window.document.body.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
      });
    }, 1);
  };
  const removeSelected = () => {
    window.umami.track('Remove reminders', { count: selected.length });
    removeReminders(selected);
    setSelected([]);
  };

  return (
    <FloatingButtons className='mt-4'>
      <ReminderModal
        trigger={
          <Button
            icon={<Plus className='h-4 w-4' />}
            size={'icon-square'}
            variant={'primary'}
            alt='Add new reminder'
          />
        }
        handleEdit={() => null}
        handleNew={handleNewRecords}
        isInEditMode={false}
        selected={[]}
      />

      {reminders.length > 0 && (
        <>
          <ReminderModal
            trigger={
              <Button
                icon={<Pencil className='h-4 w-4' />}
                size={'icon-square'}
                disabled={selected.length === 0}
                variant={'secondary'}
                alt='Edit flashcards'
              />
            }
            handleEdit={handleEditRecords}
            handleNew={() => null}
            isInEditMode={true}
            selected={updatedSelected}
          />
          <AlertDialog
            onCancel={() => {
              window.umami.track('Cancel remove flashcards');
            }}
            headerText='Are you absolutely sure?'
            bodyText='This action cannot be undone. This will permanently delete your flashcards.'
            trigger={
              <Button
                disabled={selected.length === 0}
                variant={'destructive'}
                icon={<Trash className='h-4 w-4' />}
                size={'icon-square'}
                alt='Remove flashcards'
              />
            }
            onAccept={removeSelected}
          />
        </>
      )}
    </FloatingButtons>
  );
}
