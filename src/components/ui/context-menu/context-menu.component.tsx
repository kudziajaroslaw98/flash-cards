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
  contextPossiton?:
    | 'top'
    | 'top-right'
    | 'top-left'
    | 'bottom'
    | 'left'
    | 'right';
}

export default function ContextMenuComponent(props: ContextMenuProps) {
  let contextMenuPositionStyle = '';

  switch (props.contextPossiton) {
    case 'top':
      contextMenuPositionStyle = `right-0 ${
        props.open
          ? 'z-20 animate-fade-in-to-top'
          : '-z-10 animate-fade-out-to-bottom'
      }`;
      break;
    case 'top-right':
      contextMenuPositionStyle = `right-0 ${
        props.open
          ? 'z-20 animate-fade-in-to-top'
          : '-z-10 animate-fade-out-to-bottom'
      }`;
      break;
    case 'top-left':
      contextMenuPositionStyle = `left-0 ${
        props.open
          ? 'z-20 animate-fade-in-to-top'
          : '-z-10 animate-fade-out-to-bottom'
      }`;
      break;
    case 'bottom':
    default:
      contextMenuPositionStyle = `right-0 ${
        props.open
          ? 'z-20 animate-fade-in-to-bottom'
          : '-z-10 animate-fade-out-to-top'
      }`;
      break;
  }

  return (
    <div>
      <div className='relative'>
        {props.triggerComponent}

        <div
          className={`${contextMenuPositionStyle} absolute -bottom-2 w-64 overflow-clip rounded border border-gray-200 dark:border-slate-800 md:w-52 `}
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
    </div>
  );
}
