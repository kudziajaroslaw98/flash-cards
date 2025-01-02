import { NavigationGroup } from '#/types//navigation-group.type';
import NavigationItemComponent from './navigation-item';

export interface NavigationGroupProps {
  group: NavigationGroup;
  expanded: boolean;
  visible?: boolean;
}

export default function NavigationGroupComponent(props: NavigationGroupProps) {
  const { group, expanded, visible = true } = props;

  return (
    visible && (
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
            <NavigationItemComponent
              key={item.href}
              item={item}
              expanded={expanded}
              visible={item.visible}
              className='text-gray-400'
            />
          ))}
        </div>
      </div>
    )
  );
}
