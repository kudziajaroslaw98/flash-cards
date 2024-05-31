import { ContextMenuItem } from '#/components/ui/context-menu/context-menu.component';
import type { PropsWithChildren } from 'react';

interface MenuItemProps {
  visible?: boolean;
  class?: string;
  onClick?: ContextMenuItem['onClick'];
  active?: ContextMenuItem['active'];
}

export default function MenuItem(props: PropsWithChildren<MenuItemProps>) {
  return (
    <li
      onClick={() => {
        if (props?.onClick) {
          props.onClick();
        }
      }}
      className={`
        ${props.visible ? 'flex' : 'hidden'}
        ${props.active ? 'border-l-2 border-l-green-400' : ''}
        ${
          props.onClick
            ? 'cursor-pointer hover:bg-green-400 hover:text-green-50'
            : ''
        }
         w-full items-center gap-4 border-b border-b-slate-200 bg-gray-50 px-4 py-3 text-green-400 last:border-none dark:border-b-slate-800 dark:bg-slate-900 dark:text-green-400
         ${props.class ?? ''}`}
    >
      {props.children}
    </li>
  );
}
