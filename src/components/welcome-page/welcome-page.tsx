'use client';

import { useAppContext } from '#/providers/app-context';
import { useSessionContext } from '#/providers/session-provider.component';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import * as m from 'motion/react-m';
import Link from 'next/link';
import { Button } from '../_ui/button/button';

export const WelcomePage = () => {
  const { user } = useSessionContext();
  const { flashcards, metadata } = useAppContext();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {true && (
        <div className='fixed left-0 top-0 z-[100] flex h-screen w-screen flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-slate-950'>
          <m.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className='mb-4 flex w-48 flex-col items-center justify-center text-4xl font-black text-gray-700'
          >
            <span>🔥{metadata.streak}</span>
            <span className='ml-4 text-center text-2xl font-bold'>day</span>
          </m.div>
          <m.div className='flex gap-2'>
            <m.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              className='text-4xl  text-gray-700'
            >
              Welcome back,
            </m.div>{' '}
            <m.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.7, ease: 'easeOut' }}
              className='text-4xl font-bold text-gray-700'
            >
              {user?.user_metadata.full_name.split(' ')[0]}
            </m.div>
            <m.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, rotate: [0, 15, -15, 15, 0], opacity: 1 }}
              transition={{
                delay: 1.5,
                duration: 0.7,
                ease: 'easeOut',
                rotate: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 1,
                },
              }}
              className='text-4xl font-bold'
            >
              👋
            </m.span>
          </m.div>

          <m.div className='flex flex-col items-center justify-center gap-2'>
            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.7, ease: 'easeOut' }}
              className='text-lg  text-gray-600'
            >
              Here&apos;s how you&apos;re doing so far:
            </m.div>

            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.7, ease: 'easeOut' }}
              className='mb-8 h-[1px] w-1/2 bg-gray-200'
            ></m.div>

            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3, duration: 0.7, ease: 'easeOut' }}
              className='text-gray-500'
            >
              ✅ You&apos;ve reviewed 200 flashcards this week.
            </m.div>

            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 4, duration: 0.7, ease: 'easeOut' }}
              className='text-gray-500'
            >
              📚 You have{' '}
              {
                flashcards.filter(
                  (flashcard) =>
                    new Date(flashcard.spacedRepetition.dueDate)
                      .toISOString()
                      .slice(0, 10) === today,
                ).length
              }{' '}
              that need to be revised.
            </m.div>

            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 5, duration: 0.7, ease: 'easeOut' }}
              className='text-gray-500'
            >
              ⏱️ You’ve completed 5 sessions this week.
            </m.div>
          </m.div>

          <m.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 6, duration: 0.7, ease: 'easeOut' }}
            className='mt-8 flex flex-col items-center justify-center gap-4'
          >
            <Button
              label='Continue'
              alt='Continue'
            />

            <span>or</span>

            <Link href={APP_ROUTES.flashcards.revise}>
              <Button
                variant={'primary-text'}
                label='Revise more flashcards'
                alt='Revise more flashcards'
              />
            </Link>
          </m.div>
        </div>
      )}
    </>
  );
};
