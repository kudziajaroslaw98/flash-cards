'use client';

import { createClient } from '#/shared/utils/supabase/client';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { Button } from '#/components/_ui/button/button';
import { m } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

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

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 rounded p-8 sm:overflow-clip sm:border sm:border-gray-50 sm:bg-gray-100 sm:shadow-card-hovered dark:sm:border-slate-800 dark:sm:bg-slate-900'
    >
      <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
        <span>Sign in</span>

        <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
          <FingerPrintIcon className={'h-80 w-80'} />
        </span>
      </h4>

      <div className='flex w-full flex-col gap-2'>
        <Button
          variant={'primary-outline'}
          onClick={handleOAuthGithub}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          icon={
            <Image
              src={'/images/github.svg'}
              alt={'Github Logo'}
              width={16}
              height={16}
            />
          }
          iconPosition='left'
          label='Github'
          size={'full'}
        ></Button>

        <Button
          variant={'primary-outline'}
          onClick={handleOAuthGoogle}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          icon={
            <Image
              src={'/images/google.svg'}
              alt={'Google Logo'}
              width={16}
              height={16}
            />
          }
          iconPosition='left'
          label='Google'
          size={'full'}
        ></Button>
      </div>
    </m.div>
  );
}
