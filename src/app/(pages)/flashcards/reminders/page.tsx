import { Reminders } from '#/components/reminders-page/reminders';

export default function RemindersPage() {
  return (
    <div className='flex h-full w-full grow flex-col items-center md:pb-12'>
      <Reminders />
    </div>
  );
}
