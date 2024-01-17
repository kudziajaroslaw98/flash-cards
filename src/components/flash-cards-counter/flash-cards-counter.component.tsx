'use client';

interface CounterParams {
  count: number;
}

export default function FlashCardsCounter(params: CounterParams) {
  return (
    <span className='flex flex-col items-center justify-center md:py-6'>
      <h4 className='text-8xl font-bold text-green-400 dark:text-green-600'>
        {params.count}
      </h4>
      <h4 className='mt-2 text-gray-600 dark:text-slate-400'>Learned words</h4>
    </span>
  );
}
