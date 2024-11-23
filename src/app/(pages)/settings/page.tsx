'use client';

import { useSessionContext } from '#/providers/session-provider.component';
import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import AvatarComponent from '#/components/_ui/avatar/avatar';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Button } from '#/components/_ui/button/button';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';

export default function SettingsPage() {
  const { user, updateUser, deleteUser } = useSessionContext();
  const [firstName, setFirstName] = useState(user?.user_metadata?.firstName);
  const [lastName, setLastName] = useState(user?.user_metadata?.lastName);
  const [email, setEmail] = useState(user?.email);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user?.user_metadata?.firstName);
      setLastName(user?.user_metadata?.lastName);
      setEmail(user?.email);
    }
  }, [user]);

  const handleUpdateProfile = () => {
    const metadata = {
      firstName: firstName,
      lastName: lastName,
    };

    const updateUserBody = {
      email: email,
      data: metadata,
    };
    console.log(updateUserBody);

    const validation = z.object({
      data: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
      }),
      email: z.string().email('Email is incorrect').optional(),
    });

    const result = validation.safeParse(updateUserBody);

    console.log(result);

    if (result.success) {
      updateUser(updateUserBody);
    }
  };

  const handleDeleteUser = () => {
    setIsDeleting(true);
    deleteUser();
  };

  return (
    <div className='flex w-full flex-col items-center gap-4'>
      <div className='w-full max-w-sm'>
        <section className='flex flex-col items-center gap-4'>
          <div className='flex w-full flex-col items-center justify-center gap-2'>
            <AvatarComponent
              className='size-16'
              text={`${user?.user_metadata?.firstName} ${user?.user_metadata?.lastName}`}
              imageAlt='User avatar'
            />

            <b>
              {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
            </b>

            <span className='text-sm text-gray-500'>{user?.email}</span>
          </div>

          <Button
            label='Edit Profile'
            onClick={() => handleUpdateProfile()}
            icon={<ChevronRightIcon className='size-4' />}
            iconPosition='right'
            size={'sm'}
          />
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-gray-400'>Content</span>
        <section className='flex flex-col gap-4'></section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-red-500'>Danger Zone</span>
        <section className='flex flex-col gap-4 rounded-md border border-red-500 p-4'>
          <p className='flex flex-col gap-2 text-gray-600'>
            <span className='text-sm font-semibold text-red-500'>Warning</span>

            <span className='text-sm'>
              Deleting your account will permanently{' '}
              <span className='font-bold text-red-500'>remove all</span> your
              data.
            </span>
          </p>
          <AlertDialog
            headerText='Delete Account'
            bodyText='Are you sure you want to delete your account? This action cannot be undone.'
            trigger={
              <button
                disabled={isDeleting}
                className={`rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:border-red-500 focus:outline-none focus:ring ${
                  isDeleting ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            }
            onAccept={handleDeleteUser}
            onCancel={() => setIsDeleting(false)}
          ></AlertDialog>
        </section>
      </div>
    </div>
  );
}
