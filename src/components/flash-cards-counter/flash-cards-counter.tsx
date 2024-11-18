'use client';

interface CounterParams {
  count: number;
}

export default function FlashCardsCounter(params: CounterParams) {
  return (
    <span className='flex flex-col items-center justify-center md:py-6'>
      <h4 className='text-8xl font-bold text-green-400 dark:text-green-500'>
        {params.count}
      </h4>

      <h5 className='text-default mt-2'>Learned words</h5>
    </span>
  );
}
