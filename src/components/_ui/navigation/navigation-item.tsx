'use client';

import { cn } from '#/shared/utils/cn.util';
import { NavigationItem } from '#/types//navigation-item.type';
import * as m from 'motion/react-m';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    visible && (
      <div
        key={item.href}
        className='flex flex-col'
      >
        <Link
          href={item.href}
          className={cn([
            'relative flex items-center gap-2 rounded-md px-2 py-1 text-gray-500 dark:text-slate-300',
            'transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-900 dark:hover:text-slate-200',
            isPathActive &&
              'bg-gray-100 !text-green-400 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-800',
            expanded ? 'max-w-full' : 'max-w-9 px-2',
            className,
          ])}
        >
          <span>{item.icon}</span>
          <span
            className={`overflow-clip font-medium transition-all ${expanded ? 'max-w-full' : 'max-w-0'}`}
          >
            {expanded && item.label}
          </span>

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
    )
  );
}
