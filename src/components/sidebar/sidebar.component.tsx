'use client';

import { NavigationGroup } from '#/shared/types/navigation-group.type';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  LanguageIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenuComponent from '../hamburger-menu/hamburger-menu.component';
import DividerComponent from '../ui/divider/divider.component';
import LinkComponent from '../ui/link/link.component';
import { ToggleButtonComponent } from '../ui/toggle-button/toggle-button.component';

export default function SidebarComponent() {
  const [collapsed, collapse] = useState<boolean>(true);
  const iconSize = collapsed
    ? 'h-4 w-4 transition-all'
    : 'h-5 w-5 transition-all';
  const navigationItems: NavigationItem[] = [
    {
      label: 'Learn',
      href: '/learn',
      icon: <AcademicCapIcon className={iconSize} />,
    },
    {
      label: 'Revise',
      href: '/revise',
      icon: <LanguageIcon className={iconSize} />,
    },
  ];

  const navigation: NavigationGroup[] = [
    {
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: <Squares2X2Icon className={iconSize} />,
        },
        {
          label: 'Learn',
          href: '/learn',
          icon: <AcademicCapIcon className={iconSize} />,
        },
        {
          label: 'Revise',
          href: '/revise',
          icon: <LanguageIcon className={iconSize} />,
        },
      ],
    },
    {
      divider: true,
      label: 'Community',
      icon: <UserGroupIcon className={iconSize} />,
      items: [
        {
          label: 'Sets',
          href: '/community/sets',
          icon: <RectangleStackIcon className={iconSize} />,
        },
      ],
    },
    {
      divider: true,
      label: 'Account',
      icon: <UserCircleIcon className={iconSize} />,
      items: [
        {
          label: 'Profile',
          href: '/account/profile',
          icon: <UserIcon className={iconSize} />,
        },
        {
          label: 'Settings',
          href: '/account/settings',
          icon: <Cog6ToothIcon className={iconSize} />,
        },
      ],
    },
  ];

  const handleToggle = () => {
    collapse(!collapsed);
  };

  return (
    <aside
      className={`sticky top-4 z-50 hidden max-h-[800px] flex-col rounded-md bg-red-100/5 p-4 pb-8 transition-all md:flex
      ${collapsed ? 'w-64' : 'w-20'}
    `}
    >
      <div className='mx-auto flex h-full max-w-5xl flex-col items-center justify-between'>
        <div>
          <Link
            href={'/dashboard'}
            className='flex items-center justify-center gap-2 text-xl font-thin tracking-wider'
          >
            <span>
              <Image
                width={24}
                height={24}
                src={'/images/flash-cards-logo.svg'}
                alt={'Flash Cards Logo'}
              />
            </span>

            <h5
              className={`overflow-clip font-black tracking-tighter text-green-400 transition-all dark:text-green-500 ${collapsed ? 'max-w-full' : 'max-w-0'}`}
            >
              FLASHCARDS
            </h5>
          </Link>

          <div className={`flex w-full flex-col justify-center gap-8 pt-12`}>
            <div className='hidden flex-col gap-8 md:flex'>
              {navigation.map((group) => (
                <div
                  key={`${group.label}_${group.items.length}`}
                  className='flex flex-col gap-4'
                >
                  <h6 className='flex h-6 items-center gap-2 pl-2 text-gray-500 dark:text-slate-300'>
                    <span className=' transition-colors'>{group.icon}</span>
                    <span
                      className={`overflow-clip transition-all ${collapsed ? 'max-w-full ' : 'max-w-0'}`}
                    >
                      {group.label}
                    </span>
                  </h6>

                  {group?.divider && <DividerComponent />}

                  <div className={`flex flex-col gap-2`}>
                    {group.items.map((item) => (
                      <LinkComponent
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        class={`!items-start !justify-start  rounded-md 
                        bg-gray-100/10 transition-all hover:bg-gray-200/50
                         dark:bg-slate-900/10 dark:hover:bg-slate-900 ${collapsed ? 'max-w-full' : 'max-w-9 px-2'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <span className='md:hidden'>
              <HamburgerMenuComponent navigationItems={navigationItems} />
            </span>
          </div>
        </div>

        <ToggleButtonComponent
          type='icon-only'
          class='h-10 !w-10 bg-green-400  hover:bg-green-500 active:focus:bg-green-600 dark:bg-green-500 dark:hover:bg-green-500 dark:active:focus:bg-green-700'
          activeIcon={<ChevronLeftIcon className='h-4 w-4' />}
          inactiveIcon={<ChevronRightIcon className='h-4 w-4' />}
          toggled={collapsed}
          toggle={handleToggle}
        />
      </div>
    </aside>
  );
}
