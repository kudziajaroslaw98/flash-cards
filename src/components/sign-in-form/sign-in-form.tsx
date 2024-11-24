'use client';

import { signInValidationScheme } from '#/shared/validation-schemes/sign-in-validation.scheme';
import type { SignInResponse } from '#/types//sign-in-response.type';
import { createClient } from '#/shared/utils/supabase/client';
import type { ApiResponse } from '#/types//api-response.type';
import FormComponent from '#/components/form-component/form';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { ApiRoutes } from '#/shared/enums/api-routes.enum';
import { APP_ROUTES } from '#/shared/defaults/app.routes';
import { Button } from '#/components/_ui/button/button';
import LinkComponent from '#/components/_ui/link/link';
import useFetch from '#/hooks/use-fetch.hook';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { useState } from 'react';

export default function SignInComponent() {
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
    validation: signInValidationScheme,
  };

  const [formValid, setFormValid] = useState(true);
  const [requestSuccess, setRequestSuccess] = useState<boolean | undefined>();
  const [requestErrorMsg, setRequestErrorMsg] = useState<string | undefined>();
  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof formScheme.inputs, string>>
  >({});
  const { fetch, isLoading } = useFetch();
  const supabase = createClient();

  const router = useRouter();

  const handleSignIn = async () => {
    if (!formValue.email || !formValue.password || !formValid) {
      return;
    }

    setRequestErrorMsg(undefined);
    setRequestSuccess(undefined);

    const response = await fetch<ApiResponse<SignInResponse>>(
      ApiRoutes.SIGN_IN,
      {
        body: JSON.stringify(formValue),
        method: 'POST',
      },
    );

    if (!response?.success) {
      setRequestErrorMsg(response.error);
      setRequestSuccess(false);
    } else {
      setRequestSuccess(true);

      router.push(
        `${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}${APP_ROUTES.flashcards.learn}`,
      );
    }

    router.refresh();
  };

  const handleOAuthGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'localhost:3001/api/auth/callback',
      },
    });
  };

  const handleOAuthGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'localhost:3001/api/auth/callback',
      },
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

      <div className='flex w-full flex-col gap-2 pt-4'>
        <FormComponent<Record<keyof typeof formScheme.inputs, string>>
          scheme={formScheme}
          formValid={requestSuccess}
          formError={requestErrorMsg}
          emitFormValid={setFormValid}
          emitFormValue={setFormValue}
          initialValues={
            formValue as Record<keyof typeof formScheme.inputs, string>
          }
        />
      </div>

      <div className='flex w-full flex-col gap-2'>
        <Button
          onClick={handleSignIn}
          disabled={!formValid}
          loading={isLoading ?? false}
          label='Sign in'
          size={'full'}
        ></Button>

        <Button
          onClick={handleOAuthGithub}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          label='Sign in with Github'
          size={'full'}
        ></Button>

        <Button
          onClick={handleOAuthGoogle}
          disabled={isLoading ?? false}
          loading={isLoading ?? false}
          label='Sign in with Google'
          size={'full'}
        ></Button>
      </div>

      <div className='flex flex-col items-center justify-center gap-1'>
        <span className='text-gray-600 dark:text-slate-400'>
          You don&apos;t have an account?
        </span>

        <LinkComponent
          label={'Click here'}
          href={'sign-up'}
          className={'text-green-400 underline'}
        ></LinkComponent>
      </div>
    </m.div>
  );
}
