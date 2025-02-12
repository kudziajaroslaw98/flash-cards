'use client';

import { cn } from '#/shared/utils/cn.util';
import type { NavigationAction } from '#/types/navigation-action.type';
import Tooltip from '../tooltip/tooltip';

export interface NavigationActionProps {
  item: NavigationAction;
  expanded: boolean;
  visible?: boolean;
  className?: string;
}

export default function NavigationActionComponent({
  item,
  expanded,
  className,
  visible = true,
}: NavigationActionProps) {
  const content = <span className='whitespace-nowrap'>{item.label}</span>;

  const handleActionClick = () => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    visible && (
      <Tooltip
        key={item.label}
        content={content}
        position='right'
        show={!expanded}
      >
        <div className='flex flex-col'>
          <div
            onClick={handleActionClick}
            className={cn([
              'relative flex items-center justify-center gap-2 rounded-md px-2 py-1 text-gray-500 transition-all duration-300 dark:text-slate-300',
              'hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-900 dark:hover:text-slate-200',
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
                className={`overflow-clip font-medium ${expanded ? 'max-w-full' : 'max-w-0'}`}
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
          </div>
        </div>
      </Tooltip>
    )
  );
}
