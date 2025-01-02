import { cn } from '#/shared/utils/cn.util';
import { NavigationItem } from '#/types//navigation-item.type';
import LinkComponent from '../link/link';

export interface NavigationItemProps {
  item: NavigationItem;
  expanded: boolean;
  visible?: boolean;
  className?: string;
}

export default function NavigationItemComponent({
  item,
  expanded,
  className,
  visible = true,
}: NavigationItemProps) {
  return (
    visible && (
      <LinkComponent
        key={item.href}
        href={item.href}
        iconOnly={!expanded}
        className={cn([
          '!items-start !justify-start gap-4 rounded-md bg-gray-100/10 px-2 py-1 text-green-400 transition-all hover:bg-gray-200/50 dark:bg-slate-900/10 dark:hover:bg-slate-900',
          expanded ? 'max-w-full' : 'max-w-9 px-2',
          className,
        ])}
      >
        {item.icon}
        <span
          className={`overflow-clip transition-all ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
        >
          {item.label}
        </span>
      </LinkComponent>
    )
  );
}
