'use client';

import MenuItem from '#/components/ui/context-menu/menu-item.component';
import type { ReactNode } from 'react';

export interface ContextMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface ContextMenuProps {
  triggerComponent: ReactNode;
  beforeMenuItems?: ReactNode;
  beforeMenuClass?: string;
  afterMenuItems?: ReactNode;
  afterMenuClass?: string;
  menuItems: ContextMenuItem[];
  name: string;
  open: boolean;
}

export default function ContextMenuComponent(props: ContextMenuProps) {
  return (
    <div className='relative'>
      <div>{props.triggerComponent}</div>

      <div
        className={`${
          props.open
            ? 'z-20 animate-fade-in-to-bottom'
            : '-z-10 animate-fade-out-to-top'
        } absolute -bottom-2 right-0 w-64 overflow-clip rounded border border-gray-200 md:w-52 dark:border-slate-700 `}
      >
        <ul className='flex h-auto w-full flex-col items-center'>
          <MenuItem
            visible={!!props.beforeMenuItems}
            class={props.beforeMenuClass}
          >
            {props.beforeMenuItems}
          </MenuItem>

          {props.menuItems.map((item) => (
            <MenuItem
              key={item.label}
              active={item.active}
              visible={true}
              onClick={() => {
                item.onClick();
              }}
            >
              {item.icon && item.icon} {item.label}
            </MenuItem>
          ))}

          <MenuItem
            class={props.afterMenuClass}
            visible={!!props.afterMenuItems}
          >
            {props.afterMenuItems}
          </MenuItem>
        </ul>
      </div>
    </div>
  );
}
