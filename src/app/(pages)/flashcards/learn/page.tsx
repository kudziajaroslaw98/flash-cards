import FlashCardsList from '#/components/flash-cards-list/flash-cards-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Learn with Flash Cards - Interactive Learning',
  description:
    'Start learning with our interactive flash card system. Master new concepts through active recall and spaced repetition.',
  keywords: [
    'flash card learning',
    'interactive learning',
    'spaced repetition',
    'active recall',
    'study mode',
    'learn vocabulary',
    'memorization technique',
  ],
};

export default async function LearnPage() {
  return (
    <div className='flex h-full w-full flex-col items-center gap-16'>
      <FlashCardsList />
    </div>
  );
}
