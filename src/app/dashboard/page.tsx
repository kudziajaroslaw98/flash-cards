import StatsListComponent from '#/components/stats-list/stats-list.component';

export default function DashboardPage() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <h1>Dashboard</h1>

      <StatsListComponent />
    </div>
  );
}
