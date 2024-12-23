import { title } from 'process';
import type React from 'react';

type TimelineProps = {
  title: string;
  items: Array<{
    headline: string;
    subheadline?: string;
    active: boolean;
    body: string | React.ReactNode;
  }>;
};

export default function Timeline(props: TimelineProps) {
  return (
    <div className='relative grid h-auto grid-cols-[0px_48px_1fr] items-center justify-center md:grid-cols-[1fr_125px_1fr]'>
      {props.items.map((item, index) => (
        <div
          className='group/timeline contents'
          key={`timeline-${title?.trim()?.replaceAll(' ', '-')}-item-${index}`}
        >
          <div className='col-span-1 col-start-1 hidden gap-8 pb-8 md:flex md:group-odd/timeline:hidden'>
            <div className='flex flex-col gap-2'>
              <h6 className='text-xl text-gray-800 dark:text-slate-200'>
                {item.headline}
              </h6>

              {item?.subheadline && (
                <span className='font-semibold text-gray-600 dark:text-slate-400'>
                  {item.subheadline}
                </span>
              )}

              <div className='flex flex-col text-gray-600 dark:text-slate-400'>
                {item.body}
              </div>
            </div>
          </div>

          <div className='relative col-span-1 col-start-2 flex h-full justify-center'>
            {item.active ? (
              <>
                <div className='size-6 rounded-full bg-green-500'></div>
                {index < props.items.length - 1 && (
                  <div className='absolute left-[48%] top-5 h-full w-1 bg-green-500/20'></div>
                )}
              </>
            ) : (
              <>
                <div className='size-6 rounded-full  border-4 border-green-500 bg-slate-950'></div>
                {index < props.items.length - 1 && (
                  <div className='absolute left-[48%] top-5 h-full w-1 bg-green-500/20'></div>
                )}
              </>
            )}
          </div>

          <div className='col-span-1 col-start-3 flex gap-8 pb-8 md:group-even/timeline:hidden'>
            <div className='flex flex-col gap-2'>
              <h6 className='text-xl text-gray-800 dark:text-slate-200'>
                {item.headline}
              </h6>

              {item?.subheadline && (
                <span className='font-semibold text-gray-600 dark:text-slate-400'>
                  {item.subheadline}
                </span>
              )}

              <div className='flex flex-col text-gray-600 dark:text-slate-400'>
                {item.body}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
