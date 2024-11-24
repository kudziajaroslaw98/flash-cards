'use client';

import {
  AcademicCapIcon,
  Bars3Icon,
  Cog8ToothIcon,
  HomeIcon,
  LanguageIcon,
  RectangleStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useSessionContext } from '#/providers/session-provider.component';
import ToggleButton from '#/components/_ui/toggle-button/toggle-button';
import ContextMenu from '#/components/_ui/context-menu/context-menu';
import ThemeSwitchComponent from '../theme-switch/theme-switch';
import { NavigationItem } from '#/types//navigation-item.type';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '#/components/_ui/button/button';
import LinkComponent from '#/components/_ui/link/link';
import { useEffect, useRef, useState } from 'react';
import AvatarComponent from '../_ui/avatar/avatar';
import { m } from 'framer-motion';

export default function HamburgerMenuComponent() {
  const { isLoggedIn, user, logOut } = useSessionContext();
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathName = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      icon: <HomeIcon className='size-4' />,
    },
    {
      type: 'item',
      label: 'Settings',
      href: APP_ROUTES.settings,
      icon: <Cog8ToothIcon className='size-4' />,
      visible: isLoggedIn,
    },
    {
      type: 'item',
      label: 'Sets',
      href: APP_ROUTES.flashcards.sets,
      icon: <RectangleStackIcon className='size-4' />,
    },
    {
      type: 'item',
      label: 'Learn',
      href: APP_ROUTES.flashcards.learn,
      icon: <AcademicCapIcon className='size-4' />,
    },
    {
      type: 'item',
      label: 'Revise',
      href: APP_ROUTES.flashcards.revise,
      icon: <LanguageIcon className='size-4' />,
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

  const activeIcon = (
    <m.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
      className='text-inherit'
    >
      <XMarkIcon className='h-6 w-6' />
    </m.span>
  );

  const inactiveIcon = (
    <m.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
      className='text-inherit'
    >
      <Bars3Icon className='h-6 w-6' />
    </m.span>
  );

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
            variant={'primary-text'}
            size={'icon'}
            className='z-30 w-10'
            activeIcon={activeIcon}
            inactiveIcon={inactiveIcon}
            toggle={() => {
              setOpen(!isOpen);
              toggle(!toggled);
            }}
            toggled={toggled}
          />
        }
        afterMenuItems={<ThemeSwitchComponent showLabel />}
        beforeMenuItems={
          <div className='w-full'>
            {isLoggedIn && (
              <div className='flex flex-col gap-3'>
                <div className='flex w-full flex-col items-center justify-center gap-2'>
                  <AvatarComponent className='h-12 w-12' />

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
        menuItems={navigationItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          active: item.href === pathName,
          visible: item.visible,
          onClick: () => {
            router.push(item.href);
            setOpen(false);
            toggle(false);
          },
        }))}
      ></ContextMenu>
    </div>
  );
}
