'use client';

import { createClient } from '#/shared/utils/supabase/client';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { Button } from '#/components/_ui/button/button';
import { ArrowLeftIcon, Github } from 'lucide-react';
import { m } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function SignInComponent() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleOAuthGoogle = async () => {
    window.umami.track('Sign in with Google');
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleOAuthGithub = async () => {
    window.umami.track('Sign in with Github');
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const handleBackButton = () => {
    window.umami.track('Sign in back');
    window.history.back();
  };

  const googleIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 48 48'
      className='flex size-4 fill-white'
    >
      <path d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z' />
      <path d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z' />
      <path d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z' />
      <path d='M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z' />
    </svg>
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 rounded p-8 sm:overflow-clip sm:border sm:border-gray-200 sm:shadow-card-hovered dark:sm:border-slate-800'
    >
      <div className='flex w-full items-center justify-start gap-4'>
        <Button
          icon={
            <ArrowLeftIcon className='h-4 w-4 transition group-hover:translate-x-2 group-active:translate-x-1' />
          }
          label='Back'
          onClick={() => handleBackButton()}
          variant={'primary-text'}
        />
      </div>

      <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-500'>
        <span>Sign in</span>
        <FingerPrintIcon className={'size-8'} />
      </h4>

      <div className='z-20 flex w-full flex-col gap-2'>
        <Button
          variant={'primary'}
          onClick={handleOAuthGithub}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          icon={<Github className='h-4 w-4' />}
          iconPosition='left'
          label='Github'
          size={'full'}
        ></Button>

        <Button
          variant={'primary'}
          onClick={handleOAuthGoogle}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          icon={googleIcon}
          iconPosition='left'
          label='Google'
          size={'full'}
          className='group'
        ></Button>

        <div className='flex w-full items-center justify-center gap-4 py-4'>
          <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-900' />
          <span className='text-sm text-gray-300 dark:text-slate-800'>OR</span>
          <div className='h-[2px] w-full bg-gray-200 dark:bg-slate-900' />
        </div>

        <Link href={'/flashcards/learn'}>
          <Button
            variant={'primary-outline'}
            disabled={isLoading ?? false}
            loading={isLoading ?? false}
            iconPosition='left'
            label='Continue as guest'
            size={'full'}
          ></Button>
        </Link>

        {process.env.NODE_ENV === 'development' && (
          <>
            <Button
              variant={'primary-outline'}
              onClick={() =>
                supabase.auth.signInWithPassword({
                  email: 'test@test.com',
                  password: 'test',
                })
              }
              disabled={isLoading ?? false}
              loading={isLoading ?? false}
              iconPosition='left'
              label='password'
              size={'full'}
            ></Button>

            <Button
              variant={'primary-outline'}
              onClick={() =>
                supabase.auth.signInWithPassword({
                  email: 'test2@test.com',
                  password: 'test',
                })
              }
              disabled={isLoading ?? false}
              loading={isLoading ?? false}
              iconPosition='left'
              label='password 2'
              size={'full'}
            ></Button>
          </>
        )}
      </div>
    </m.div>
  );
}
