'use client';

import { PropsWithChildren, ReactNode, useState } from 'react';

interface ContextMenuItem {
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
}

interface MenuItemProps {
  visible: boolean;
  class?: string;
  onClick?: ContextMenuItem['onClick'];
  active?: ContextMenuItem['active'];
}

export default function ContextMenuComponent(props: ContextMenuProps) {
  const [open, setOpen] = useState(false);

  const MenuItem = (menuItemProps: PropsWithChildren<MenuItemProps>) => {
    return (
      <li
        onClick={() => {
          if (menuItemProps?.onClick) {
            setOpen(false);
            menuItemProps.onClick();
          }
        }}
        className={`
        ${menuItemProps.visible ? 'flex' : 'hidden'}
        ${menuItemProps.active ? 'border-l-2 border-l-green-400' : ''}
        ${
          menuItemProps.onClick
            ? 'cursor-pointer hover:bg-green-400 hover:text-green-50'
            : ''
        }
         w-full items-center gap-2 border-b border-b-slate-200 bg-gray-50 px-4 py-3 text-green-400 last:border-none dark:border-b-slate-700 dark:bg-slate-800 dark:text-green-400
         ${menuItemProps.class ?? ''}`}
      >
        {menuItemProps.children}
      </li>
    );
  };

  return (
    <div className='relative'>
      <div onClick={() => setOpen(!open)}>{props.triggerComponent}</div>

      <div
        className={`${
          open ? 'animate-fade-in-to-bottom ' : 'animate-fade-out-to-top'
        } absolute -bottom-2 right-0 z-20 w-64 overflow-clip rounded border border-gray-200 md:w-52 dark:border-slate-700 `}
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
                setOpen(false);
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
