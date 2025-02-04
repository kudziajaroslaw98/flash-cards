'use client';

import { cn } from '#/shared/utils/cn.util';
import { NavigationItem } from '#/types//navigation-item.type';
import * as m from 'motion/react-m';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Tooltip from '../tooltip/tooltip';

export interface NavigationItemProps {
  item: NavigationItem;
  expanded: boolean;
  visible?: boolean;
  className?: string;
}

export default function NavigationItemComponent({
  item,
  expanded,
  className,
  visible = true,
}: NavigationItemProps) {
  const pathName = usePathname();
  const isPathActive = pathName.includes(item.href);

  const content = <span className='whitespace-nowrap'>{item.label}</span>;

  return (
    visible && (
      <Tooltip
        key={item.href}
        content={content}
        position='right'
        show={!expanded}
      >
        <div className='flex flex-col'>
          <Link
            href={item.href}
            className={cn([
              'relative flex items-center justify-center gap-2 rounded-md px-2 py-1 text-gray-500 dark:text-slate-300',
              'transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-900 dark:hover:text-slate-200',
              isPathActive &&
                'bg-gray-100 !text-green-400 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800',
              expanded ? 'max-w-full' : 'max-w-9 px-2',
              className,
            ])}
          >
            <div
              className={cn([
                'flex flex-grow items-center',
                expanded ? 'gap-2' : 'gap-0',
              ])}
            >
              <span>{item.icon}</span>
              <span
                className={`overflow-clip font-medium transition-all ${expanded ? 'max-w-full' : 'max-w-0'}`}
              >
                <span className='flex-grow'>{expanded && item.label}</span>
              </span>
            </div>
            {item?.indicator !== undefined && (
              <span
                className={cn([
                  'flex h-3 w-fit items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                  'bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-slate-200',
                  !expanded && 'absolute -right-1 -top-1',
                ])}
              >
                {item.indicator}
              </span>
            )}

            {isPathActive && (
              <m.span
                layoutId='link-underline'
                className={cn([
                  '-left-2 top-1/2 h-1 w-1',
                  'absolute rounded bg-green-400 group-hover:bg-green-400',
                ])}
              ></m.span>
            )}
          </Link>
        </div>
      </Tooltip>
    )
  );
}
