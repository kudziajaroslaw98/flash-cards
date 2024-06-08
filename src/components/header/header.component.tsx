import HamburgerMenuComponent from '#/components/hamburger-menu/hamburger-menu.component';
import LinkComponent from '#/components/ui/link/link.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { NavigationItem } from '#/shared/types/navigation-item.type';
import {
  AcademicCapIcon,
  HashtagIcon,
  HomeIcon,
  LanguageIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderComponent() {
  const navigationItems: NavigationItem[] = [
    {
      type: 'item',
      label: 'Dashboard',
      href: APP_ROUTES.dashboard,
      icon: <HomeIcon className='size-4' />,
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

  return (
    <header className='fixed left-0 top-0 z-30 h-20 w-full bg-gray-50/75 px-4 py-4 backdrop-blur-xl dark:bg-slate-900/75 md:hidden'>
      <div className='mx-auto flex h-full max-w-5xl items-center justify-between'>
        <div className='flex items-center justify-center gap-4'>
          <Link
            href={'/dashboard'}
            className='flex items-center justify-center gap-2 text-xl font-thin tracking-wider'
          >
            <span>
              <Image
                width={24}
                height={24}
                src={'/images/flash-fusion-logo.svg'}
                alt={'Flash Fusion Logo'}
              />
            </span>

            <h5 className='bg-gradient-to-r from-green-600  to-green-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent transition-all '>
              FLASHCARDS
            </h5>
          </Link>

          <span className='hidden items-center gap-1 text-gray-500 dark:text-slate-300 lg:flex'>
            <span>
              <HashtagIcon className='h-4 w-4' />
            </span>

            <p>Learning words made easy</p>
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
              />
            ))}
          </div>

          <HamburgerMenuComponent navigationItems={navigationItems} />
        </div>
      </div>
    </header>
  );
}
