import HamburgerMenuComponent from '#/components/hamburger-menu/hamburger-menu';
import { HashtagIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderComponent() {
  return (
    <header className='fixed left-0 top-0 z-[90] h-20 w-full bg-gray-50/75 px-4 py-4 backdrop-blur-xl dark:bg-slate-900/75 md:hidden'>
      <div className='mx-auto flex h-full max-w-5xl items-center justify-between'>
        <div className='flex items-center justify-center gap-4'>
          <Link
            href={'/'}
            className='flex items-center justify-center gap-2 text-xl font-thin tracking-wider'
          >
            <span>
              <Image
                width={24}
                height={24}
                src={'/images/flash-cards-logo.svg'}
                alt={'Flash Cards Logo'}
                loading='eager'
              />
            </span>

            <h1 className='bg-gradient-to-r from-green-600 to-green-400  bg-clip-text text-2xl font-black uppercase tracking-tighter text-transparent transition-all'>
              FLASHCARDS
            </h1>
          </Link>

          <span className='hidden items-center gap-1 text-gray-500 dark:text-slate-300 lg:flex'>
            <span>
              <HashtagIcon className='h-4 w-4' />
            </span>

            <p>Learning words made easy</p>
          </span>
        </div>

        <div className='flex items-center justify-center gap-4 md:gap-8'>
          <HamburgerMenuComponent />
        </div>
      </div>
    </header>
  );
}
