import HardestFlashcardsComponent from '#/components/hardest-flashcards/hardest-flashcards.component';
import StatsListComponent from '#/components/stats-list/stats-list.component';

export default function DashboardPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-16'>
      <HardestFlashcardsComponent />

      <StatsListComponent />
    </div>
  );
}
