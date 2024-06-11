'use client';

import { Button } from '#/components/ui/button/button.component';
import ContextMenu from '#/components/ui/context-menu/context-menu.component';
import LinkComponent from '#/components/ui/link/link.component';
import { ToggleButton } from '#/components/ui/toggle-button/toggle-button.component';
import { useSessionContext } from '#/providers/session-provider.component';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeSwitchComponent from '../theme-switch/theme-switch.component';
import AvatarComponent from '../ui/avatar/avatar.component';

interface HamburgerMenuProps {
  navigationItems: NavigationItem[];
}

export default function HamburgerMenuComponent(props: HamburgerMenuProps) {
  const [toggled, toggle] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const { isLoggedIn, session, logOut } = useSessionContext();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathName = usePathname();

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
      <XMarkIcon className='h-6 w-6' />
    </motion.span>
  );

  const inactiveIcon = (
    <motion.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
      className='text-inherit'
    >
      <Bars3Icon className='h-6 w-6' />
    </motion.span>
  );

  return (
    <div
      className='flex'
      ref={menuRef}
    >
      <ContextMenu
        open={isOpen}
        setOpen={setOpen}
        name={'hamburger-menu'}
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
                  <AvatarComponent
                    avatarClass='h-12 w-12'
                    text={`${session?.user?.user_metadata?.firstName} ${session?.user?.user_metadata?.lastName}`}
                  />

                  <span className='text-inherit'>
                    {session?.user?.user_metadata?.firstName}{' '}
                    {session?.user?.user_metadata?.lastName}
                  </span>
                </div>

                <Button
                  onClick={() => {
                    logOut();
                    setOpen(false);
                    toggle(!toggled);
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
                    toggle(!toggled);
                    setOpen(false);
                  }}
                  href={'/sign-in'}
                  className={'text-inherit underline'}
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
      ></ContextMenu>
    </div>
  );
}
