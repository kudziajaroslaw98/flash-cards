'use client';

import HamburgerMenuComponent from '#/components/hamburger-menu/hamburger-menu.component';
import LinkComponent from '#/components/ui/link/link.component';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { NavigationItem } from '#/utils/interfaces/navigation-item.interface';
import {
  AcademicCapIcon,
  HashtagIcon,
  HomeIcon,
  LanguageIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HeaderComponent() {
  const pathname = usePathname();

  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <HomeIcon className='h-4 w-4' />,
    },
    {
      label: 'Learn',
      href: '/learn',
      icon: <AcademicCapIcon className='h-4 w-4' />,
    },
    {
      label: 'Revise',
      href: '/revise',
      icon: <LanguageIcon className='h-4 w-4' />,
    },
  ]);

  useEffect(() => {
    setNavigationItems(
      navigationItems.map((item) => {
        item.active = pathname === item.href;
        return item;
      }),
    );
  }, [pathname]);

  const { value, setToLocalStorage } = useLocalStorage('theme', {
    theme: 'dark',
  });

  const changeTheme = () => {
    setToLocalStorage({ theme: value.theme === 'dark' ? 'light' : 'dark' });
  };

  const isDarkMode = (): boolean => {
    return value.theme === 'dark';
  };

  useEffect(() => {
    if (
      value.theme === 'dark' ||
      (!('theme' in value) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.querySelector('html')?.classList.add('dark');
    } else {
      document.querySelector('html')?.classList.remove('dark');
    }
  }, [value.theme]);

  return (
    <header className='fixed left-0 top-0 z-30 h-20 w-full bg-gray-50/20 px-4 py-4 backdrop-blur-xl dark:bg-slate-900/20'>
      <div className='mx-auto flex h-full max-w-5xl items-center justify-between'>
        <div className='flex items-center justify-center gap-4'>
          <Link
            href={'/dashboard'}
            className='flex items-center justify-center gap-2 text-xl font-thin tracking-wider text-green-400 dark:text-green-500'
          >
            <span>
              <Image
                width={24}
                height={24}
                src={'/images/flash-cards-logo.svg'}
                alt={'Flash Cards Logo'}
              />
            </span>

            <span className='font-black tracking-tighter'>FLASHCARDS</span>
          </Link>

          <span className='hidden items-center gap-1 text-gray-500 lg:flex dark:text-slate-300'>
            <span>
              <HashtagIcon className='h-4 w-4' />
            </span>
            <span>Learning words made easy</span>
          </span>
        </div>

        <div className='flex items-center justify-center gap-4 md:gap-8'>
          <div className='hidden items-center justify-center gap-4 md:flex md:gap-8'>
            {navigationItems.map((item) => (
              <LinkComponent
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
              />
            ))}
          </div>

          <HamburgerMenuComponent
            changeTheme={changeTheme}
            isDarkMode={isDarkMode}
            navigationItems={navigationItems}
          />
        </div>
      </div>
    </header>
  );
}
