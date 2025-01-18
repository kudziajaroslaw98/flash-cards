'use client';

import MenuItem from '#/components/_ui/context-menu/menu-item';
import useOutsideAlerter from '#/hooks/use-click-outside.hook';
import { cn } from '#/shared/utils/cn.util';
import { cva, VariantProps } from 'class-variance-authority';
import {
  useEffect,
  useRef,
  useState,
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import MenuGroupItem from './menu-group-item';

const contextMenuVariants = cva(
  `absolute w-64 opacity-0 overflow-clip rounded border border-gray-200 dark:border-slate-800 md:w-52 z-20`,
  {
    variants: {
      contextPosition: {
        top: 'right-0 -top-2 data-[open="open"]:animate-fade-in-to-top data-[open="closed"]:animate-fade-out-to-bottom',
        'top-right':
          'right-0 -top-2 data-[open="open"]:animate-fade-in-to-top data-[open="closed"]:animate-fade-out-to-bottom',
        'top-left':
          'left-0 -top-2 data-[open="open"]:animate-fade-in-to-top data-[open="closed"]:animate-fade-out-to-bottom',
        bottom:
          'right-0 -bottom-2 data-[open="open"]:animate-fade-in-to-bottom data-[open="closed"]:animate-fade-out-to-top',
      },
    },
    defaultVariants: {
      contextPosition: 'bottom',
    },
  },
);

export type ContextMenuItem =
  | {
      type: 'item';
      label?: string;
      icon?: ReactNode;
      onClick: () => void;
      active?: boolean;
      visible?: boolean;
    }
  | {
      type: 'group';
      label?: string;
      items?: ContextMenuItem[];
      icon?: ReactNode;
      visible?: boolean;
    };

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
  initialOpen?: boolean;
}

export default function ContextMenu({
  contextPosition,
  className,
  initialOpen = false,
  ...props
}: ContextMenuProps) {
  const contextMenuWrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  useOutsideAlerter(contextMenuWrapperRef, () => {
    if (open) {
      setOpen(false);
      window.umami.track('Close context menu on click outside', {
        name: props.name,
      });
    }
  });

  const handleTriggerClick = () => {
    window.umami.track('Toggle context menu', { name: props.name });
    setOpen((prev) => !prev);
  };

  return (
    <div>
      <div
        className='relative'
        ref={contextMenuWrapperRef}
      >
        <div onClick={handleTriggerClick}>{props.triggerComponent}</div>

        <div
          data-open={open ? 'open' : 'closed'}
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

            {props.menuItems.map((item: ContextMenuItem, index) =>
              item.type === 'group' ? (
                <MenuGroupItem
                  key={`group-${item.label}-${index}`}
                  className='group'
                  visible={item.visible}
                  items={item.items || []}
                >
                  {item.icon && item.icon} {item.label}
                </MenuGroupItem>
              ) : (
                <MenuItem
                  key={`item-${item.label}-${index}`}
                  active={item.active}
                  visible={item.visible}
                  onClick={() => {
                    item.onClick();
                  }}
                >
                  {item.icon && item.icon} {item.label}
                </MenuItem>
              ),
            )}

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
