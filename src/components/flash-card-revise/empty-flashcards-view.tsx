import { ArrowRight, Coffee } from 'lucide-react';
import { Button } from '../_ui/button/button';
import LinkComponent from '../_ui/link/link';

export function EmptyFlashcardsView() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
      <div className='flex w-full flex-col items-center justify-center py-10 text-center'>
        <Coffee className='mb-8 size-12 text-green-500' />
        <span>This review session is a no-show</span>
        <span>your flashcards must be off on a coffee break.</span>

        <LinkComponent
          href='/flashcards/learn'
          className='mt-8'
        >
          <Button
            label='Time to bring them back!'
            icon={<ArrowRight className='size-4' />}
            iconPosition='right'
            alt='Redirect to learn page'
          />
        </LinkComponent>
      </div>
    </div>
  );
}
