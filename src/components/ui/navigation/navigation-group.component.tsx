import { NavigationGroup } from '#/shared/types/navigation-group.type';
import LinkComponent from '../link/link.component';

export interface NavigationGroupProps {
  group: NavigationGroup;
  expanded: boolean;
}

export default function NavigationGroupComponent(props: NavigationGroupProps) {
  const { group, expanded } = props;

  return (
    <div
      key={`${group.label}_${group.items.length}`}
      className={`flex flex-col ${expanded ? 'gap-4' : 'gap-6'}`}
    >
      {(group?.label || group?.icon) && (
        <h6
          className={`flex items-center pl-2 text-green-400  ${expanded && 'gap-4 pl-2'}`}
        >
          <span className='transition-colors'>{group?.icon}</span>

          <span
            className={`overflow-clip transition-all ${expanded ? 'max-w-full ' : 'hidden max-w-0'}`}
          >
            {group?.label}
          </span>
        </h6>
      )}

      <div
        className={`flex flex-col gap-4 ${expanded && 'ml-4 border-l-2 border-gray-100 pl-2 dark:border-slate-900'}`}
      >
        {group.items.map((item) => (
          <LinkComponent
            key={item.href}
            href={item.href}
            iconOnly={!expanded}
            className={`!items-start !justify-start gap-4 rounded-md bg-gray-100/10 px-2 py-1 text-gray-400 transition-all hover:bg-gray-200/50 dark:bg-slate-900/10 dark:hover:bg-slate-900 ${expanded ? 'max-w-full' : 'max-w-9 px-2'}`}
          >
            {item.icon}
            <span
              className={`overflow-clip transition-all ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
            >
              {item.label}
            </span>
          </LinkComponent>
        ))}
      </div>
    </div>
  );
}
