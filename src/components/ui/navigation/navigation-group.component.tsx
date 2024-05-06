import { NavigationGroup } from '#/shared/types/navigation-group.type';
import DividerComponent from '../divider/divider.component';
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
      className='flex flex-col gap-2'
    >
      {(group?.label || group?.icon) && (
        <h6 className='flex items-center gap-4 pl-2 text-green-400'>
          <span className='transition-colors'>{group?.icon}</span>
          <span
            className={`overflow-clip transition-all ${expanded ? 'max-w-full ' : 'max-w-0'}`}
          >
            {group?.label}
          </span>
        </h6>
      )}

      {group?.divider && <DividerComponent />}

      <div className={`ml-4 flex flex-col gap-4 pl-2`}>
        {group.items.map((item) => (
          <LinkComponent
            key={item.href}
            href={item.href}
            class={`!items-start
                        !justify-start gap-4
                        rounded-md bg-gray-100/10 px-2 py-1
                        text-gray-400 transition-all hover:bg-gray-200/50
                         dark:bg-slate-900/10 dark:hover:bg-slate-900 ${expanded ? 'max-w-full' : 'max-w-9 px-2'}`}
          >
            {item.icon}
            <span
              className={`overflow-clip transition-all ${expanded ? 'max-w-full' : 'max-w-0'}`}
            >
              {item.label}
            </span>
          </LinkComponent>
        ))}
      </div>
    </div>
  );
}
