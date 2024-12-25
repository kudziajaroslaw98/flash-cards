'use client';

import {
  ArrowUp,
  GraduationCap,
  Languages,
  Layers,
  LayoutDashboard,
  Settings,
  UserRound,
  Zap,
} from 'lucide-react';
import ContextMenu, {
  type ContextMenuItem,
} from '#/components/_ui/context-menu/context-menu';
import { useSessionContext } from '#/providers/session-provider.component';
import ToggleButton from '#/components/_ui/toggle-button/toggle-button';
import type { NavigationGroup } from '#/types/navigation-group.type';
import ThemeSwitchComponent from '../theme-switch/theme-switch';
import { NavigationItem } from '#/types//navigation-item.type';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '#/components/_ui/button/button';
import LinkComponent from '#/components/_ui/link/link';
import { useEffect, useRef, useState } from 'react';
import AvatarComponent from '../_ui/avatar/avatar';
import { MenuIcon } from '../_ui/_icons/menu';

export default function HamburgerMenuComponent() {
  const { isLoggedIn, user, logOut, isPlanActive } = useSessionContext();
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathName = usePathname();
  const iconSize = 'size-4';
  const groupIconSize = 'size-5';

  const navigationItems: (NavigationItem | NavigationGroup)[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      visible: true,
      icon: <LayoutDashboard className={`${iconSize} fill-current`} />,
    },
    {
      type: 'group',
      label: 'Flash Cards',
      icon: <Zap className={`${groupIconSize} fill-current`} />,
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
      ],
    },
    {
      type: 'group',
      label: 'Account',
      icon: <UserRound className={`${groupIconSize}`} />,
      visible: isLoggedIn,
      items: [
        {
          type: 'item',
          label: 'Settings',
          href: APP_ROUTES.account.settings,
          icon: <Settings className={iconSize} />,
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

  const handlePlanUpgrade = () => {
    window.umami.track('Upgrade plan clicked');

    if (!isLoggedIn) {
      router.push(APP_ROUTES.signIn);
      return;
    } else {
      router.push(APP_ROUTES.pricing);
    }
  };

  const mapToContextMenuItem = (
    items: (NavigationItem | NavigationGroup)[],
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
      } else {
        return {
          type: 'group',
          label: item.label,
          icon: item.icon,
          visible: item.visible,
          items: mapToContextMenuItem(item.items),
        };
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
          />
        }
        afterMenuItems={
          <div className='flex w-full flex-col items-center justify-center gap-4'>
            {!isPlanActive && (
              <Button
                icon={<ArrowUp className='size-6' />}
                onClick={handlePlanUpgrade}
                label={'Upgrade Plan'}
                size={'default'}
                variant={'secondary-text'}
              />
            )}
            <ThemeSwitchComponent showLabel />
          </div>
        }
        beforeMenuItems={
          <div className='w-full'>
            {isLoggedIn && (
              <div className='flex flex-col gap-3'>
                <div className='flex w-full flex-col items-center justify-center gap-2'>
                  <AvatarComponent
                    className='h-12 w-12'
                    imageAlt='User avatar'
                    imageSrc={user?.user_metadata?.avatar_url}
                  />

                  <span className='text-inherit'>
                    {user?.user_metadata?.name}
                  </span>
                </div>

                <Button
                  onClick={() => {
                    logOut();
                    setOpen(false);
                    toggle(false);
                  }}
                  color='red'
                  label='Log out'
                />
              </div>
            )}

            {!isLoggedIn && (
              <div className='flex flex-col gap-3'>
                <div className='flex w-full flex-col items-center justify-center'>
                  <span className='text-inherit'>You are not logged in.</span>
                </div>

                <LinkComponent
                  label={'You can do it here'}
                  onClick={() => {
                    toggle(false);
                    setOpen(false);
                  }}
                  href={'/sign-in'}
                  className={'text-inherit underline'}
                ></LinkComponent>
              </div>
            )}
          </div>
        }
        menuItems={mappedNavigationItems}
      ></ContextMenu>
    </div>
  );
}
