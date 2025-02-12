import LinkComponent from '#/components/_ui/link/link';
import { ArrowRight } from 'lucide-react';

export default function StudyPage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center gap-12 md:pb-12'>
      <div className='flex flex-col justify-center gap-2 text-gray-800 dark:text-slate-200'>
        <span>Welcome to the study page,</span>
        <span>What will you study today?</span>
      </div>

      <div className='flex w-80 flex-col gap-6 text-gray-600 dark:text-slate-400'>
        <div className='flex w-full flex-col justify-center gap-2'>
          <span className='text-sm'>Master flashcards</span>
          <LinkComponent
            href='/flashcards/learn'
            label='Flashcards'
            icon={
              <ArrowRight className='size-4 transition group-hover:translate-x-2' />
            }
            iconPosition='right'
            className='w-full items-start justify-start text-green-500'
          />
        </div>

        <div className='flex w-full flex-col justify-center gap-2'>
          <span className='text-sm'>Make study plan</span>
          <LinkComponent
            href='/study/plan'
            label='Study Plan'
            icon={
              <ArrowRight className='size-4 transition group-hover:translate-x-2' />
            }
            iconPosition='right'
            className='w-full items-start justify-start text-green-500'
          />
        </div>
      </div>
    </div>
  );
}
