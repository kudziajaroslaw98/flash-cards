import type { PropsWithChildren } from 'react';
import type { ContextMenuItem } from './context-menu';
import MenuItem from './menu-item';

interface MenuItemProps {
  visible?: boolean;
  className?: string;
  items: ContextMenuItem[];
}

export default function MenuGroupItem(props: PropsWithChildren<MenuItemProps>) {
  const { visible, children, className } = props;
  return (
    visible && (
      <>
        <li
          className={`
         flex w-full items-center gap-4 bg-gray-50 px-4 py-2 text-sm text-green-400 last:border-none dark:border-b-slate-800 dark:bg-slate-900 dark:text-green-400
         ${className ?? ''}`}
        >
          {children}
        </li>
        <li
          className={`
         flex w-full items-center gap-4 border-b border-b-slate-200 bg-gray-50 pl-6  text-sm text-green-400 dark:border-b-slate-800 dark:bg-slate-900 dark:text-green-400
         ${className ?? ''}`}
        >
          <ul
            key={`group-ul-item-${props.items[0].label}`}
            className='flex h-full w-full flex-col'
          >
            {props.items.map((item, index) => {
              if (item.type === 'item') {
                return (
                  <MenuItem
                    key={`group-item-${item.label}-${index}`}
                    active={item.active}
                    visible={item.visible}
                    locked={item.locked}
                    indicator={item.indicator}
                    onClick={() => {
                      item.onClick();
                    }}
                    className='border-l-2 border-l-slate-200 pl-4 dark:border-l-slate-800'
                  >
                    {item.icon && item.icon} {item.label}
                  </MenuItem>
                );
              } else if (item.type === 'action') {
                return (
                  <MenuItem
                    key={`group-action-${item.label}-${index}`}
                    visible={item.visible}
                    onClick={() => {
                      item.onClick();
                    }}
                    className='border-l-2 border-l-slate-200 pl-4 dark:border-l-slate-800'
                  >
                    {item.icon && item.icon} {item.label}
                  </MenuItem>
                );
              }
            })}
          </ul>
        </li>
      </>
    )
  );
}
