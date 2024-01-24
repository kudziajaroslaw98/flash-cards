'use client';

import ButtonComponent from '#/components/ui/button/button.component';
import InputComponent from '#/components/ui/input/input.component';
import LinkComponent from '#/components/ui/link/link.component';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { z } from 'zod';

export default function LoginFormComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const emailValidation = z.string().email();
  const passwordValidation = z.string().min(8);

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
      .then(async (res) => {
        if (res.data.session) {
          await supabase.auth.setSession({
            refresh_token: res.data.session.refresh_token,
            access_token: res.data.session.access_token,
          });
          router.push(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/revise`);
        }
      });

    router.refresh();
  };

  const checkValidity = (
    value: string,
    scheme: z.ZodString,
    setter: Dispatch<SetStateAction<boolean>>,
  ): boolean => {
    const isValid = scheme.safeParse(value).success;
    setter(isValid);

    return isValid;
  };

  return (
    <div className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 overflow-clip rounded border border-gray-50 bg-gray-100 p-8 shadow-card-hovered dark:border-slate-800 dark:bg-slate-900'>
      <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
        <span>Login</span>

        <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
          <FingerPrintIcon className={'h-80 w-80'} />
        </span>
      </h4>

      <div className='flex w-full flex-col gap-2 py-4'>
        <InputComponent<string>
          type={'email'}
          name={'email'}
          label={'Email'}
          placeholder={'example@email.com'}
          value={email}
          validate={(value) =>
            checkValidity(value, emailValidation, setEmailValid)
          }
          onInput={(e) => setEmail(e.currentTarget.value)}
        />

        <InputComponent<string>
          type={'password'}
          name={'password'}
          label={'Password'}
          value={password}
          validate={(value) =>
            checkValidity(value, passwordValidation, setPasswordValid)
          }
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
      </div>

      <ButtonComponent
        class={
          'max-w-80 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 md:h-10 md:w-full dark:bg-green-500 dark:hover:bg-green-400'
        }
        onClick={handleSignIn}
        disabled={!emailValid || !passwordValid}
      >
        Sign in
      </ButtonComponent>

      <div className='flex flex-col items-center justify-center gap-1'>
        <span className='text-gray-600 dark:text-slate-400'>
          You don't have an account?
        </span>

        <LinkComponent
          label={'Click here'}
          href={'sign-up'}
          class={'underline'}
        ></LinkComponent>
      </div>
    </div>
  );
}
