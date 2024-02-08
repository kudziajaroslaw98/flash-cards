'use client';

import ButtonComponent from '#/components/ui/button/button.component';
import ContextMenuComponent from '#/components/ui/context-menu/context-menu.component';
import LinkComponent from '#/components/ui/link/link.component';
import SwitchComponent from '#/components/ui/switch/switch.component';
import { ToggleButtonComponent } from '#/components/ui/toggle-button/toggle-button.component';
import { useSessionContext } from '#/providers/session-provider.component';
import { useThemeContext } from '#/providers/theme-provider.component';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface HamburgerMenuProps {
  navigationItems: NavigationItem[];
}

export default function HamburgerMenuComponent(props: HamburgerMenuProps) {
  const router = useRouter();
  const pathName = usePathname();
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, session, logOut } = useSessionContext();
  const { changeTheme, isDarkMode } = useThemeContext();

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
    <motion.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
      className='text-inherit'
    >
      <XMarkIcon className='h-8 w-8' />
    </motion.span>
  );

  const inactiveIcon = (
    <motion.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
      className='text-inherit'
    >
      <Bars3Icon className='h-8 w-8' />
    </motion.span>
  );

  return (
    <div
      className='flex'
      ref={menuRef}
    >
      <ContextMenuComponent
        open={isOpen}
        name={'hamburger-menu'}
        afterMenuClass='py-4 justify-center'
        triggerComponent={
          <ToggleButtonComponent
            type={'icon-only'}
            class='z-30 !px-2 !text-green-400 transition hover:bg-green-400 hover:!text-gray-50 active:focus:bg-green-500'
            activeIcon={activeIcon}
            inactiveIcon={inactiveIcon}
            toggle={() => {
              setOpen(!isOpen);
              toggle(!toggled);
            }}
            toggled={toggled}
          />
        }
        afterMenuItems={
          <SwitchComponent
            checkedLabel={'Dark mode'}
            uncheckedLabel={'Light mode'}
            onClick={changeTheme}
            value={isDarkMode}
          >
            {isDarkMode ? (
              <MoonIcon className='h-4 w-4' />
            ) : (
              <SunIcon className='h-4 w-4' />
            )}
          </SwitchComponent>
        }
        beforeMenuItems={
          <div className='w-full'>
            {isLoggedIn && (
              <div className='flex flex-col gap-3'>
                <div className='flex w-full flex-col items-center justify-center'>
                  <UserCircleIcon className='h-8 w-8' />

                  <span className='text-inherit'>
                    {session?.user?.user_metadata?.firstName}{' '}
                    {session?.user?.user_metadata?.lastName}
                  </span>
                </div>

                <ButtonComponent
                  onClick={() => {
                    logOut();
                    setOpen(false);
                    toggle(!toggled);
                  }}
                  class='h-8 bg-red-300 hover:bg-red-400'
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
                    toggle(!toggled);
                    setOpen(false);
                  }}
                  href={'/sign-in'}
                  class={'text-inherit underline'}
                ></LinkComponent>
              </div>
            )}
          </div>
        }
        menuItems={props.navigationItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          active: item.href === pathName,
          onClick: () => {
            router.push(item.href);
            setOpen(false);
            toggle(!toggled);
          },
        }))}
      ></ContextMenuComponent>
    </div>
  );
}
