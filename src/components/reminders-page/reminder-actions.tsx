import { Plus } from 'lucide-react';
import { Button } from '../_ui/button/button';
import { FloatingButtons } from '../floating-buttons/floating-buttons';

export function ReminderActions() {
  return (
    <FloatingButtons className='mt-4'>
      <Button
        icon={<Plus className='h-4 w-4' />}
        size={'icon-square'}
        variant={'primary'}
        alt='Add new reminder'
      />
    </FloatingButtons>
  );
}
