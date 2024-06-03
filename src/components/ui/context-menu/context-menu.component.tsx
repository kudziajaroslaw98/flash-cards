'use client';

import MenuItem from '#/components/ui/context-menu/menu-item.component';
import { cn } from '#/shared/utils/cn.util';
import { cva, VariantProps } from 'class-variance-authority';
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

const contextMenuVariants = cva(
  `absolute w-64 overflow-clip rounded border border-gray-200 dark:border-slate-800 md:w-52`,
  {
    variants: {
      contextPosition: {
        top: 'right-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-right':
          'right-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        'top-left':
          'left-0 -top-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-top data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-bottom',
        bottom:
          'right-0 -bottom-2 data-[open=true]:z-20 data-[open=true]:animate-fade-in-to-bottom data-[open=false]:-z-10 data-[open=false]:animate-fade-out-to-top',
      },
    },
    defaultVariants: {
      contextPosition: 'bottom',
    },
  },
);

export interface ContextMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface ContextMenuProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    VariantProps<typeof contextMenuVariants> {
  triggerComponent: ReactNode;
  beforeMenuItems?: ReactNode;
  beforeMenuClass?: string;
  afterMenuItems?: ReactNode;
  afterMenuClass?: string;
  menuItems: ContextMenuItem[];
  name: string;
  open: boolean;
}

export default function ContextMenu({
  contextPosition,
  className,
  ...props
}: ContextMenuProps) {
  return (
    <div>
      <div className='relative'>
        {props.triggerComponent}

        <div
          data-open={props.open}
          className={cn([contextMenuVariants({ contextPosition }), className])}
        >
          <ul className='flex h-auto w-full flex-col items-center'>
            {!!props.beforeMenuItems && (
              <MenuItem
                visible={!!props.beforeMenuItems}
                className={props.beforeMenuClass}
              >
                {props.beforeMenuItems}
              </MenuItem>
            )}

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

            {!!props.afterMenuItems && (
              <MenuItem
                className={props.afterMenuClass}
                visible={!!props.afterMenuItems}
              >
                {props.afterMenuItems}
              </MenuItem>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
