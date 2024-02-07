'use client';

import FormComponent from '#/components/form-component/form.component';
import ButtonComponent from '#/components/ui/button/button.component';
import LinkComponent from '#/components/ui/link/link.component';
import useFetch from '#/hooks/use-fetch.hook';
import { ApiRoutes } from '#/shared/enums/api-routes.enum';
import { ApiResponse } from '#/shared/types/api/api-response.type';
import { SignInResponse } from '#/shared/types/api/sign-in-response.type';
import { signInValidationScheme } from '#/shared/validation-schemes/sign-in-validation.scheme';
import { FingerPrintIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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

      router.push(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/learn`);
    }

    router.refresh();
  };

  return (
    <AnimatePresence mode='popLayout'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 rounded p-8 dark:border-slate-800 dark:bg-slate-900 sm:overflow-clip sm:border sm:border-gray-50 sm:bg-gray-100 sm:shadow-card-hovered'
      >
        <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
          <span>Sign in</span>

          <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
            <FingerPrintIcon className={'h-80 w-80'} />
          </span>
        </h4>

        <div className='flex w-full flex-col gap-2 pt-4'>
          <FormComponent
            scheme={formScheme}
            formValid={requestSuccess}
            formError={requestErrorMsg}
            emitFormValid={setFormValid}
            emitFormValue={setFormValue}
          />
        </div>

        <ButtonComponent
          class={
            'flex max-w-80 gap-2 bg-green-400 hover:bg-green-500 active:focus:bg-green-600 disabled:border-gray-300 disabled:text-gray-400 dark:bg-green-500 dark:hover:bg-green-400 md:h-10 md:w-full'
          }
          onClick={handleSignIn}
          disabled={!formValid || isLoading}
          loading={isLoading}
          label='Sign in'
        ></ButtonComponent>

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
      </motion.div>
    </AnimatePresence>
  );
}
