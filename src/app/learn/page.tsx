import FlashCardsTable from '#/components/flash-cards-table/flash-cards-table';

export default async function LearnPage() {
  return (
    <div className='flex h-full w-full flex-col items-center gap-16'>
      <FlashCardsTable />
    </div>
  );
}
