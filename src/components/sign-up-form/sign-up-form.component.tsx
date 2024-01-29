'use client';

import FormComponent from '#/app/playground/form.component';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import ButtonComponent from '../ui/button/button.component';
import LinkComponent from '../ui/link/link.component';

export default function SignUpFormComponent() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const formScheme = {
    inputs: {
      firstName: {
        type: 'text',
        name: 'firstName',
        label: 'First Name',
        placeholder: 'John',
        required: true,
      },
      lastName: {
        type: 'text',
        name: 'lastName',
        label: 'Last Name',
        placeholder: 'Doe',
        required: true,
      },
      email: {
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'example@email.com',
        required: true,
      },
      password: {
        type: 'password',
        name: 'password',
        label: 'Password',
        required: true,
      },
      confirmPassword: {
        type: 'password',
        name: 'confirmPassword',
        label: 'Confirm Password',
        required: true,
      },
    },
    validation: z
      .object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Email is incorrect'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z
          .string()
          .min(8, 'Password must be at least 8 characters long'),
      })
      .refine(({ password, confirmPassword }) => password === confirmPassword, {
        path: ['confirmPassword'],
        message: `Passwords don't match`,
      }),
  };

  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof formScheme.inputs, string>>
  >({});
  const [formValid, setFormValid] = useState(true);

  const handleSignUp = async () => {
    const { email, password, confirmPassword, firstName, lastName } = formValue;

    if (
      !email ||
      !password ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !formValid
    ) {
      return;
    }

    // todo: change to API call
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          firstName,
          lastName,
        },
      },
    });

    router.refresh();
  };

  return (
    <div className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 overflow-clip rounded border border-gray-50 bg-gray-100 p-8 shadow-card-hovered dark:border-slate-800 dark:bg-slate-900'>
      <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
        <span>Sign Up</span>

        <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
          <RocketLaunchIcon className={'h-80 w-80'} />
        </span>
      </h4>

      <div className='flex w-full flex-col gap-2 py-4'>
        <FormComponent
          scheme={formScheme}
          emitFormValid={setFormValid}
          emitFormValue={setFormValue}
        />
      </div>

      <ButtonComponent
        class={
          'max-w-80 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 md:h-10 md:w-full dark:bg-green-500 dark:hover:bg-green-400'
        }
        onClick={handleSignUp}
        disabled={!formValid}
      >
        Sign up
      </ButtonComponent>

      <div className='flex flex-col items-center justify-center gap-1'>
        <span className='text-gray-600 dark:text-slate-400'>
          You already have an account?
        </span>

        <LinkComponent
          label={'Click here'}
          href={'login'}
          class={'underline'}
        ></LinkComponent>
      </div>
    </div>
  );
}
