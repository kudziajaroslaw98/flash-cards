import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default async function Home() {
  const roadMapPoints = [
    'Dark/Light mode - It`s still under development',
    'Revise flash cards using a spaced repetition algorithm',
    'Revise set flash cards (now revise work on all flash cards)',
    'Organize flash cards into decks',
    'Community Section with shared decks',
    'Daily word suggestion',
    'Generating descriptions to words with AI',
    'Generating new words for deck based on words that are already in it',
    'Live updates (WebSockets)',
    'Importing flash cards from CSV file',
    'Synchronize your flash cards across all devices',
  ];

  return (
    <div className='flex h-full w-full justify-center'>
      <div className='flex w-full max-w-md flex-col items-center gap-4'>
        <div className='flex flex-col items-center gap-2'>
          <h2 className='bg-gradient-to-r from-green-600 to-green-400  bg-clip-text text-5xl font-black uppercase tracking-tighter text-transparent transition-all'>
            FLASHCARDS
          </h2>

          <h6 className='font-light text-gray-500 dark:text-slate-200'>
            Your flash cards in one place
          </h6>
        </div>

        <span className='flex flex-col gap-4 text-gray-800 dark:text-slate-400'>
          <span>Welcome in Flashcards app.</span>

          <span>
            This app was created to help you learn words you actually want to
            learn. It&apos;s simple to use and easy to understand. The app is
            filled with default data to let you start playing with it right
            away.
          </span>

          <span>
            Application is still in development. If you have any questions,
            suggestions or you want to report a very annoying bug (bugs are to
            be expected at this stage), please contact me.
          </span>

          <span className='flex w-full items-center justify-center gap-4'>
            <EnvelopeIcon className='size-4' />
            <span>-</span>
            <span>jaroslawkudzia73@gmail.com</span>
          </span>

          <span className='flex w-full items-center justify-center gap-4'>
            <XMarkIcon className='size-4' />
            <span>-</span>
            <span>@BaldManHimself</span>
          </span>

          <h6>Road Map</h6>

          {roadMapPoints.map((point, index) => (
            <span
              key={`point-${index}`}
              className='flex items-center gap-2'
            >
              <span className='flex min-h-4 min-w-4 rounded-md bg-gray-300'></span>
              <span>{point}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
