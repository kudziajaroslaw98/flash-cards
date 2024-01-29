'use client';

import FormComponent from '#/app/playground/form.component';
import ButtonComponent from '#/components/ui/button/button.component';
import LinkComponent from '#/components/ui/link/link.component';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

export default function LoginFormComponent() {
  const formScheme = {
    inputs: {
      email: {
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'example@email.com',
      },
      password: {
        type: 'password',
        name: 'password',
        label: 'Password',
      },
    },
    validation: z.object({
      email: z.string().email('Email is incorrect.'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
    }),
  };

  const [formValid, setFormValid] = useState(true);
  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof formScheme.inputs, string>>
  >({});

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    if (!formValue?.['email'] || !formValue?.['password'] || !formValid) {
      return;
    }

    // todo: change to API call
    await supabase.auth
      .signInWithPassword({
        email: formValue?.['email'],
        password: formValue?.['password'],
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

  return (
    <div className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 overflow-clip rounded border border-gray-50 bg-gray-100 p-8 shadow-card-hovered dark:border-slate-800 dark:bg-slate-900'>
      <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
        <span>Login</span>

        <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
          <FingerPrintIcon className={'h-80 w-80'} />
        </span>
      </h4>

      <div className='flex w-full flex-col gap-2 py-4'>
        <FormComponent
          debug={{
            inputs: true,
            validity: true,
            errors: true,
          }}
          scheme={formScheme}
          emitFormValid={setFormValid}
          emitFormValue={setFormValue}
        />
      </div>

      <ButtonComponent
        class={
          'max-w-80 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 md:h-10 md:w-full dark:bg-green-500 dark:hover:bg-green-400'
        }
        onClick={handleSignIn}
        disabled={!formValid}
      >
        Sign in
      </ButtonComponent>

      <div className='flex flex-col items-center justify-center gap-1'>
        <span className='text-gray-600 dark:text-slate-400'>
          You don&apos;t have an account?
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
