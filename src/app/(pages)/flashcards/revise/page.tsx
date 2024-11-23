import FlashCardReviseComponent from '#/components/flash-card-revise/flash-card-revise';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Revise Flash Cards - Review and Remember',
  description:
    'Review your flash cards with our advanced revision system. Strengthen your memory and track your progress.',
  keywords: [
    'flash card revision',
    'review system',
    'memory improvement',
    'progress tracking',
    'study review',
    'revision mode',
    'memory reinforcement',
  ],
};

export default function RevisePage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center'>
      <FlashCardReviseComponent />
    </div>
  );
}
