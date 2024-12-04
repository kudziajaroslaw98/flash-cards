import { cn } from '#/shared/utils/cn.util';
import type { ReactNode } from 'react';

type Shortcut =
  | {
      keys: (string | ReactNode)[];
      name: string;
      combination?: (string | ReactNode)[];
    }
  | {
      combination: (string | ReactNode)[];
      name: string;
      keys?: (string | ReactNode)[];
    };

type ShortcutListProps = {
  shortcuts: Shortcut[];
  className?: string;
};

export const ShortcutList = ({ shortcuts, className }: ShortcutListProps) => {
  return (
    <ul
      className={cn([
        'flex flex-wrap justify-center gap-4',
        ' text-gray-500  dark:text-slate-400',
        className,
      ])}
    >
      {shortcuts.map((shortcut, index) => (
        <ShortcutListItem
          key={`shortcut-list-item-${shortcut.name}-${index}`}
          shortcut={shortcut}
        />
      ))}
    </ul>
  );
};

const ShortcutListItem = ({ shortcut }: { shortcut: Shortcut }) => {
  const combinationLength = shortcut.combination?.length ?? 0;
  const keysLength = shortcut.keys?.length ?? 0;

  const combination = () => (
    <span className='flex items-center'>
      {shortcut.combination?.map((key, index) => (
        <span key={`shortcut-${shortcut.name}-key-${index}`}>
          <span className='rounded border border-gray-200 px-2 py-1 text-xs font-semibold dark:border-slate-900'>
            {key}
          </span>
          {index !== combinationLength - 1 && <span className='mr-1'>+</span>}
        </span>
      ))}
    </span>
  );

  const keys = () => (
    <span className='flex items-center'>
      {shortcut.keys?.map((key, index) => (
        <span key={`shortcut-${shortcut.name}-key-${index}`}>
          <span className='rounded border border-gray-200 px-2 py-1 text-xs font-semibold dark:border-slate-900'>
            {key}
          </span>
          {index !== keysLength - 1 && <span className='mr-1'>,</span>}
        </span>
      ))}
    </span>
  );

  return (
    <li className='flex items-center gap-2'>
      <span className='text-sm'>{shortcut.name}</span>
      {shortcut.combination !== undefined && combination()}
      {shortcut.combination ? combination() : keys()}
    </li>
  );
};
