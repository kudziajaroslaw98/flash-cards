'use client';

import { NavigationGroup } from '#/shared/types/navigation-group.type';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  LanguageIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import HamburgerMenuComponent from '../hamburger-menu/hamburger-menu.component';
import ThemeSwitchComponent from '../theme-switch/theme-switch.component';
import NavigationGroupComponent from '../ui/navigation/navigation-group.component';
import NavigationItemComponent from '../ui/navigation/navigation-item.component';
import { ToggleButtonComponent } from '../ui/toggle-button/toggle-button.component';

export default function SidebarComponent() {
  const [expanded, toggleExpand] = useState<boolean>(true);
  const iconSize = expanded
    ? 'h-4 w-4 transition-all'
    : 'h-5 w-5 transition-all';
  const groupIconSize = 'h-5 w-5 transition-all';
  const navigationItems: NavigationItem[] = [
    {
      type: 'item',
      label: 'Learn',
      href: '/flashcards/learn',
      icon: <AcademicCapIcon className={iconSize} />,
    },
    {
      type: 'item',
      label: 'Revise',
      href: '/flashcards/revise',
      icon: <LanguageIcon className={iconSize} />,
    },
  ];

  const navigation: (NavigationItem | NavigationGroup)[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Squares2X2Icon className={iconSize} />,
    },
    {
      type: 'group',
      label: 'Flash Cards',
      icon: <BoltIcon className={groupIconSize} />,
      items: [
        {
          type: 'item',
          label: 'Learn',
          href: '/flashcards/learn',
          icon: <AcademicCapIcon className={iconSize} />,
        },
        {
          type: 'item',
          label: 'Revise',
          href: '/flashcards/revise',
          icon: <LanguageIcon className={iconSize} />,
        },
        // {
        //   type: 'item',
        //   label: 'Sets',
        //   href: '/flashcards/sets',
        //   icon: <RectangleStackIcon className={iconSize} />,
        // },
      ],
    },
  ];

  const handleToggle = () => {
    toggleExpand(!expanded);
  };

  return (
    <aside
      className={`sticky top-4 z-50 hidden max-h-[calc(100vh-2rem)] flex-col rounded-md border border-gray-300 bg-gray-50 transition-all dark:border-slate-900 dark:bg-slate-950 md:flex
      ${expanded ? 'w-96' : 'w-20'}
    `}
    >
      <div
        className={`relative flex items-center border-b border-gray-300 p-4 dark:border-slate-900 ${expanded ? 'justify-between' : 'justify-center'}`}
      >
        <Link
          href={'/dashboard'}
          className={`flex items-center font-thin tracking-wider ${expanded && 'gap-2'}`}
        >
          <Image
            width={expanded ? 16 : 24}
            height={16}
            src={'/images/flash-cards-logo.svg'}
            alt={'Flash Cards Logo'}
          />

          <h5
            className={`overflow-clip text-lg font-bold tracking-tighter text-green-400 transition-all dark:text-green-500 ${expanded ? 'max-w-full' : 'hidden max-w-0'}`}
          >
            FLASHC
            <span className='font-medium'>A</span>
            <span className='font-light'>R</span>
            <span className='font-extralight'>D</span>
            <span className='font-thin'>S</span>
          </h5>
        </Link>

        <ToggleButtonComponent
          type='icon-only'
          class='absolute -right-2 !h-5 !w-5 bg-green-400 !p-0 hover:bg-green-500 active:focus:bg-green-600 dark:bg-green-500 dark:hover:bg-green-500 dark:active:focus:bg-green-700'
          activeIcon={<ArrowLeftIcon className='h-3 w-3' />}
          inactiveIcon={<ArrowRightIcon className='h-3 w-3' />}
          toggled={expanded}
          toggle={handleToggle}
        />
      </div>

      <div className={`flex w-full flex-col justify-center gap-8 p-4`}>
        <div
          className={`hidden flex-col gap-8 md:flex ${!expanded && 'items-center'}`}
        >
          {navigation?.map((section) => (
            <>
              {section?.type === 'item' && (
                <NavigationItemComponent
                  item={section}
                  expanded={expanded}
                />
              )}

              {section?.type === 'group' && (
                <NavigationGroupComponent
                  group={section}
                  expanded={expanded}
                />
              )}
            </>
          ))}
        </div>

        <span className='md:hidden'>
          <HamburgerMenuComponent navigationItems={navigationItems} />
        </span>

        <div>
          <ThemeSwitchComponent showLabel={expanded} />
        </div>
      </div>
    </aside>
  );
}
