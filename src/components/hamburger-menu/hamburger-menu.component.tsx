'use client';

import ContextMenuComponent from '#/components/ui/context-menu/context-menu.component';
import SwitchComponent from '#/components/ui/switch/switch.component';
import { ToggleButtonComponent } from '#/components/ui/toggle-button/toggle-button.component';
import { NavigationItem } from '#/utils/interfaces/navigation-item.interface';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HamburgerMenuProps {
  changeTheme: () => void;
  isDarkMode: () => boolean;
  navigationItems: NavigationItem[];
}

export default function HamburgerMenuComponent(props: HamburgerMenuProps) {
  const router = useRouter();
  const [toggled, toggle] = useState(false);

  const activeIcon = (
    <motion.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
    >
      <XMarkIcon className='h-8 w-8' />
    </motion.span>
  );

  const inactiveIcon = (
    <motion.span
      animate={{ rotate: '180deg' }}
      initial={{ rotate: '0deg' }}
      exit={{ rotate: '0deg', opacity: 0 }}
    >
      <Bars3Icon className='h-8 w-8' />
    </motion.span>
  );

  return (
    <div className='flex md:hidden'>
      <ContextMenuComponent
        name={'hamburger-menu'}
        afterMenuClass='py-4 justify-center'
        triggerComponent={
          <ToggleButtonComponent
            type={'icon-only'}
            class='z-30 !px-2 !text-green-400 transition hover:bg-green-400 hover:!text-gray-50 active:focus:bg-green-500'
            activeIcon={activeIcon}
            inactiveIcon={inactiveIcon}
            toggle={() => toggle(!toggled)}
            toggled={toggled}
          ></ToggleButtonComponent>
        }
        afterMenuItems={
          <SwitchComponent
            checkedLabel={'Dark mode'}
            uncheckedLabel={'Light mode'}
            onClick={props.changeTheme}
            value={props.isDarkMode()}
          >
            {props.isDarkMode() ? (
              <MoonIcon className='h-4 w-4' />
            ) : (
              <SunIcon className='h-4 w-4' />
            )}
          </SwitchComponent>
        }
        menuItems={props.navigationItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          active: item.active,
          onClick: () => {
            router.push(item.href);
            toggle(!toggled);
          },
        }))}
      ></ContextMenuComponent>
    </div>
  );
}
