'use client';

import { NavigationGroup } from '#/types//navigation-group.type';
import * as m from 'motion/react-m';
import NavigationItemComponent from './navigation-item';

export interface NavigationGroupProps {
  group: NavigationGroup;
  expanded: boolean;
  visible?: boolean;
}

export default function NavigationGroupComponent(props: NavigationGroupProps) {
  const { group, expanded, visible = true } = props;

  const variants = {
    hidden: {
      maxWidth: 0,
      opacity: 0,
    },
    visible: {
      maxWidth: '100%',
      opacity: 1,
    },
  };

  return (
    visible && (
      <div
        key={`${group.label}_${group.items.length}`}
        className={`flex flex-col pt-4 ${expanded ? 'gap-4' : 'gap-6'}`}
      >
        {(group?.label || group?.icon) && (
          <span
            className={`flex items-center text-sm text-gray-400 dark:text-slate-500 ${expanded && 'gap-2 pl-2'}`}
          >
            {expanded && (
              <m.span
                variants={variants}
                transition={{ duration: 0.2 }}
                animate={expanded ? 'visible' : 'hidden'}
              >
                {group?.label}
              </m.span>
            )}

            <span className='h-0.5 w-full bg-gray-100 dark:bg-slate-900'></span>
          </span>
        )}

        <div
          className={`flex flex-col gap-2 ${expanded && 'border-gray-100 dark:border-slate-900'}`}
        >
          {group.items.map((item) => (
            <NavigationItemComponent
              key={item.href}
              item={item}
              expanded={expanded}
              visible={item.visible}
            />
          ))}
        </div>
      </div>
    )
  );
}
