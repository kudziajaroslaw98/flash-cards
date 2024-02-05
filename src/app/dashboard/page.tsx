import HardestFlashcardsComponent from '#/components/hardest-flashcards/hardest-flashcards.component';
import QuickStartComponent from '#/components/quick-start/quick-start.component';
import StatsListComponent from '#/components/stats-list/stats-list.component';
import WordOfTheDayComponent from '#/components/word-of-the-day/word-of-the-day.component';

export default function DashboardPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-16'>
      <QuickStartComponent />

      <WordOfTheDayComponent />

      <HardestFlashcardsComponent />

      <StatsListComponent />
    </div>
  );
}
