import HamburgerMenuComponent from '#/components/hamburger-menu/hamburger-menu';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderComponent() {
  return (
    <header className='fixed left-0 top-0 z-[90] h-20 w-full bg-transparent px-4 py-4 md:hidden'>
      <div className='relative z-30 mx-auto flex h-full max-w-5xl items-center justify-between'>
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
                alt={'Flashcards Logo'}
                loading='eager'
              />
            </span>

            <h1 className='bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-1 text-2xl font-black uppercase tracking-tighter text-transparent transition-all'>
              FLASHCARDS
            </h1>
          </Link>
        </div>

        <div className='flex items-center justify-center gap-4 md:gap-8'>
          <HamburgerMenuComponent />
        </div>
      </div>
      <div className='absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-transparent bg-[radial-gradient(transparent_1px,#f9fafb_1px)] from-transparent via-black via-20% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t dark:bg-[radial-gradient(transparent_1px,#020617_1px)]' />
    </header>
  );
}
