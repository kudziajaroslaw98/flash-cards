import HardestFlashcardsComponent from '#/components/hardest-flashcards/hardest-flashcards';
import StatsListComponent from '#/components/stats-list/stats-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  authors: [
    { name: 'Final Phase', url: 'https://finalphase.app' },
    { name: 'Jarosław Kudzia', url: 'https://github.com/kudziajaroslaw98' },
  ],
  creator: 'Jarosław Kudzia',
  title: 'Dashboard - Flash Cards',
  description:
    'View your learning progress, recent sets, and study statistics in one place.',
  keywords: [
    'flash cards dashboard',
    'learning progress',
    'study statistics',
    'flashcards overview',
    'learning dashboard',
  ],
};

export default function DashboardPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-16'>
      <HardestFlashcardsComponent />

      <StatsListComponent />
    </div>
  );
}
