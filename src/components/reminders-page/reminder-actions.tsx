import { Plus } from 'lucide-react';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';
import { ReminderModal } from '../reminder-modal/reminder-modal';

export function ReminderActions() {
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
        handleNew={() => null}
        isInEditMode
        selected={[]}
      />
    </FloatingButtons>
  );
}
