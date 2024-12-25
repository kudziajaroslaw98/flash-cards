import type { PropsWithChildren } from 'react';

interface MenuItemProps {
  visible?: boolean;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  border?: boolean;
}

export default function MenuItem(props: PropsWithChildren<MenuItemProps>) {
  const {
    active,
    className,
    children,
    onClick: handleItemClick,
    visible = true,
    border = true,
  } = props;

  const handleClick = () => {
    if (handleItemClick) {
      window.umami.track('Click context menu item');
      handleItemClick();
    }
  };
  return (
    visible && (
      <li
        onClick={handleClick}
        className={`
        ${active ? 'border-l-2 !border-l-green-400' : ''}
        ${border ? 'border-b border-b-slate-200 last:border-b-0 dark:border-b-slate-800' : 'border-b-0  last:border-b '}
        ${
          handleItemClick
            ? 'cursor-pointer hover:bg-green-400 hover:text-green-50 dark:hover:bg-slate-800 dark:hover:text-green-50'
            : ''
        }
         flex w-full items-center gap-4  border-b border-b-slate-200 bg-gray-50 px-4 py-3  text-sm text-green-400 last:border-b-0 dark:border-b-slate-800 dark:bg-slate-900 dark:text-green-400
         ${className ?? ''}`}
      >
        {children}
      </li>
    )
  );
}
