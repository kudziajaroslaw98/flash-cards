'use client';

import FormComponent from '#/components/form-component/form.component';
import useFetch from '#/hooks/use-fetch.hook';
import { ApiRoutes } from '#/shared/enums/api-routes.enum';
import { ApiResponse } from '#/shared/types/api/api-response.type';
import { SignUpResponse } from '#/shared/types/api/sign-up-response.type';
import { signUpValidationScheme } from '#/shared/validation-schemes/sign-up-validation.scheme';
import { CheckBadgeIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button/button.component';
import LinkComponent from '../ui/link/link.component';

export default function SignUpFormComponent() {
  const router = useRouter();

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
    validation: signUpValidationScheme,
  };

  const [formValue, setFormValue] = useState<
    Partial<Record<keyof typeof formScheme.inputs, string>>
  >({});
  const [formValid, setFormValid] = useState(true);
  const [requestSuccess, setRequestSuccess] = useState<boolean | undefined>();
  const [requestErrorMsg, setRequestErrorMsg] = useState<string | undefined>();
  const { fetch, isLoading } = useFetch();

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

    const response = await fetch<ApiResponse<SignUpResponse>>(
      ApiRoutes.SIGN_UP,
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
    }

    router.refresh();
  };

  return (
    <AnimatePresence mode='popLayout'>
      {!requestSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          key={'signup-wrapper'}
          className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 rounded p-8 dark:border-slate-800 dark:bg-slate-900 sm:overflow-clip sm:border sm:border-gray-50 sm:bg-gray-100 sm:shadow-card-hovered'
        >
          <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
            <span>Sign Up</span>

            <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
              <RocketLaunchIcon className={'h-80 w-80'} />
            </span>
          </h4>

          <div className='flex w-full flex-col gap-2 py-4'>
            <FormComponent
              scheme={formScheme}
              formValid={requestSuccess}
              formError={requestErrorMsg}
              emitFormValid={setFormValid}
              emitFormValue={setFormValue}
            />
          </div>

          <Button
            onClick={handleSignUp}
            disabled={!formValid || isLoading}
            loading={isLoading}
            label='Sign up'
          />

          <div className='flex flex-col items-center justify-center gap-1'>
            <span className='text-gray-600 dark:text-slate-400'>
              You already have an account?
            </span>

            <LinkComponent
              label={'Click here'}
              href={'sign-in'}
              class={'underline'}
            ></LinkComponent>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          key={'confirmation-wrapper'}
          className='relative flex w-full max-w-sm flex-col items-center justify-center gap-12 overflow-clip rounded border border-gray-50 bg-gray-100 p-8 shadow-card-hovered dark:border-slate-800 dark:bg-slate-900'
        >
          <h4 className='flex items-center justify-center gap-2 text-3xl font-semibold text-green-400'>
            <span>You are almost there!</span>

            <span className='absolute left-0 top-0 flex -translate-x-1/4 -translate-y-1/4 items-center justify-center opacity-10 dark:opacity-5'>
              <CheckBadgeIcon className={'h-80 w-80'} />
            </span>
          </h4>

          <div className='flex w-full flex-col gap-4 py-4 text-gray-600 dark:text-slate-200'>
            <p className='text-center'>
              Confirmation link was sent to your email.
            </p>

            <p className='text-center'>
              You just need to click on it to activate your account.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
