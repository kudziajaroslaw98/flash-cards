import { type PropsWithChildren } from 'react';

export function AllRevised(props: PropsWithChildren) {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4'>
      <p className='flex flex-col gap-1 text-center text-gray-600 dark:text-slate-400'>
        <span>All today&apos;s cards have been reviewed</span>
        <span>Do you want to continue?</span>
        <span className='pt-2 text-sm text-gray-500 dark:text-slate-500'>
          Review timeline will be only affected for <b>again and hard</b>{' '}
          options
        </span>
      </p>

      {props.children}
    </div>
  );
}
