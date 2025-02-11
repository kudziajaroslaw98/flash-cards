'use client';

import ContextMenu, {
  type ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import ToggleButton from '#/components/_ui/toggle-button/toggle-button';
import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { NavigationItem } from '#/types//navigation-item.type';
import type { NavigationAction } from '#/types/navigation-action.type';
import type { NavigationGroup } from '#/types/navigation-group.type';
import {
  ArrowUp,
  BookOpenText,
  Clock,
  GraduationCap,
  House,
  Languages,
  Layers,
  LogIn,
  LogOut,
  PlayCircle,
  Settings,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MenuIcon } from '../_ui/_icons/menu';
import ThemeSwitchComponent from '../theme-switch/theme-switch';

export default function HamburgerMenuComponent() {
  const { isLoggedIn, logOut, isPlanActive } = useSessionContext();
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathName = usePathname();
  const iconSize = 'size-4';

  const navigationItems: (
    | NavigationItem
    | NavigationGroup
    | NavigationAction
  )[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      visible: true,
      icon: <House className={`${iconSize}`} />,
    },
    {
      type: 'item',
      label: 'How to use',
      href: APP_ROUTES.guide,
      visible: true,
      icon: <BookOpenText className={`${iconSize} `} />,
    },
    {
      type: 'item',
      label: 'Playground',
      href: '/playground',
      visible: process.env.NODE_ENV === 'development',
      icon: <PlayCircle className={`${iconSize} `} />,
    },
    {
      type: 'group',
      label: 'Flashcards',
      visible: true,
      items: [
        {
          type: 'item',
          label: 'Sets',
          href: APP_ROUTES.flashcards.sets,
          icon: <Layers className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Learn',
          href: APP_ROUTES.flashcards.learn,
          icon: <GraduationCap className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Revise',
          href: APP_ROUTES.flashcards.revise,
          icon: <Languages className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Reminders',
          href: APP_ROUTES.flashcards.reminders,
          icon: <Clock className={iconSize} />,
          visible: isLoggedIn,
        },
      ],
    },
    {
      type: 'group',
      label: 'Account',
      visible: isLoggedIn,
      items: [
        {
          type: 'item',
          label: 'Settings',
          href: APP_ROUTES.account.settings,
          icon: <Settings className={iconSize} />,
        },
        {
          type: 'action',
          label: 'Log out',
          icon: <LogOut className={iconSize} />,
          onClick: () => {
            logOut();
          },
          visible: isLoggedIn,
        },
        {
          type: 'item',
          label: 'Log In',
          href: APP_ROUTES.signIn,
          icon: <LogIn className={iconSize} />,
          visible: !isLoggedIn,
        },
      ],
    },
    {
      type: 'group',
      label: 'Premium',
      visible: true && !isPlanActive,
      items: [
        {
          type: 'item',
          label: 'Upgrade plan',
          href: APP_ROUTES.pricing,
          icon: <ArrowUp className={iconSize} />,
        },
      ],
    },
  ];

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        toggle(false);
      }
    };
    document.addEventListener('click', handler, true);
    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  const mapToContextMenuItem = (
    items: (NavigationItem | NavigationGroup | NavigationAction)[],
  ): ContextMenuItem[] => {
    return items.map((item) => {
      if (item.type === 'item') {
        return {
          type: 'item',
          label: item.label,
          icon: item.icon,
          active: item.href === pathName,
          visible: item.visible,
          onClick: () => {
            router.push(item.href);
            setOpen(false);
            toggle(false);
          },
        } satisfies ContextMenuItem;
      } else if (item.type === 'group') {
        return {
          type: 'group',
          label: item.label,
          icon: item.icon,
          visible: item.visible,
          items: mapToContextMenuItem(item.items),
        };
      } else {
        return {
          type: 'item',
          label: item.label,
          icon: item.icon,
          visible: item.visible,
          onClick: () => {
            setOpen(false);
            toggle(false);
          },
        } satisfies ContextMenuItem;
      }
    }) as ContextMenuItem[];
  };

  const mappedNavigationItems: ContextMenuItem[] =
    mapToContextMenuItem(navigationItems);

  return (
    <div
      className='flex'
      ref={menuRef}
    >
      <ContextMenu
        name={'hamburger-menu'}
        initialOpen={isOpen}
        afterMenuClass='py-4 justify-center'
        triggerComponent={
          <ToggleButton
            animated={true}
            variant={'primary-text'}
            size={'icon'}
            className='z-30 w-10'
            animatedIcon={MenuIcon({ animate: toggled })}
            toggle={() => {
              setOpen(!isOpen);
              toggle(!toggled);
            }}
            toggled={toggled}
            alt='Hamburger menu toggle'
          />
        }
        afterMenuItems={
          <div className='flex w-full flex-col items-center justify-center gap-4'>
            <ThemeSwitchComponent showLabel />
          </div>
        }
        menuItems={mappedNavigationItems}
        className='!w-52'
      ></ContextMenu>
    </div>
  );
}
