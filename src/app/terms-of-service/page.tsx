import { Button } from '#/components/_ui/button/button';
import TermsOfService from '#/markdown/terms-of-service.mdx';
import { cn } from '#/shared/utils/cn.util';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as m from 'motion/react-m';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const animatedPlayIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-4 fill-none transition-all group-hover:translate-x-1 group-hover:fill-white'
    >
      <m.polygon
        points='6 3 20 12 6 21 6 3'
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
      />
    </svg>
  );

  return (
    <div className='dark relative h-auto w-full flex-col items-center justify-center bg-slate-950 px-4'>
      <header className='fixed left-0 top-0 z-50 hidden h-32 w-full flex-col items-center justify-center md:flex '>
        <div className='absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-transparent bg-[radial-gradient(transparent_1px,#020617_1px)] from-transparent via-black via-60% to-black to-100% bg-[size:4px_4px] backdrop-blur-sm mask-image-gradient-to-t' />
        <nav className='z-30 flex h-full w-full items-start justify-between px-4 py-4 md:px-16 md:pt-8'>
          <div className='flex items-center justify-center'>
            <Image
              src='/images/finalphase-logo.svg'
              alt='Flashcards Logo'
              width={32}
              height={32}
            />

            <span
              className={`hidden overflow-clip bg-gradient-to-r from-green-600 to-green-400 bg-clip-text px-1 font-fredoka text-xl font-black tracking-tight text-transparent transition-all lg:flex`}
            >
              Final Phase
            </span>
          </div>

          <ul className='flex flex-row items-center justify-center gap-4 text-slate-200'>
            <li className='pl-8'>
              <Link href='/sign-in'>
                <Button
                  variant='primary-outline'
                  label='Get Started Free'
                  className='group mx-auto min-w-36 font-semibold'
                  icon={animatedPlayIcon}
                  iconPosition='right'
                  alt='Redirect to sign in page'
                />
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <div
        className={cn([
          'prose mx-auto py-36 prose-headings:mt-8 prose-headings:font-bold prose-h1:text-5xl prose-h2:text-4xl prose-h2:font-extrabold prose-h3:text-xl prose-h3:font-bold',
          'text-gray-600 prose-h1:text-green-400 prose-h2:text-gray-800 prose-h3:text-gray-600 prose-strong:text-green-400',
          'dark:text-slate-400 dark:prose-h1:text-green-400 dark:prose-h2:text-slate-200 dark:prose-h3:text-slate-400 dark:prose-a:text-slate-400',
        ])}
      >
        <div className='flex w-full justify-between'>
          <Link
            href={'/'}
            className='z-[100]'
          >
            <Button
              alt='go back button'
              label='Home'
              icon={<ArrowLeft className='size-4' />}
              iconPosition='left'
              size={'sm'}
            />
          </Link>
          <Link
            href={'/privacy-policy'}
            className='z-[100]'
          >
            <Button
              alt='go back button'
              label='Privacy policy'
              icon={<ArrowRight className='size-4' />}
              iconPosition='right'
              size={'sm'}
            />
          </Link>
        </div>
        <TermsOfService />
      </div>
    </div>
  );
}
