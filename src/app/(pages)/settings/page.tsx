'use client';

import {
  BellIcon,
  ChevronRightIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/solid';
import { useSessionContext } from '#/providers/session-provider.component';
import ThemeSwitchComponent from '#/components/theme-switch/theme-switch';
import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import AvatarComponent from '#/components/_ui/avatar/avatar';
import { Button } from '#/components/_ui/button/button';
import Switch from '#/components/_ui/switch/switch';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';

export default function SettingsPage() {
  const { user, updateUser, deleteUser } = useSessionContext();
  const [firstName, setFirstName] = useState(user?.user_metadata?.firstName);
  const [lastName, setLastName] = useState(user?.user_metadata?.lastName);
  const [email, setEmail] = useState(user?.email);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

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

    const validation = z.object({
      data: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
      }),
      email: z.string().email('Email is incorrect').optional(),
    });

    const result = validation.safeParse(updateUserBody);

    if (result.success) {
      updateUser(updateUserBody);
    }
  };

  const handleDeleteUser = () => {
    setIsDeleting(true);
    deleteUser();
  };

  const handleNotificationChange = async () => {
    await Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        setNotificationEnabled(true);
      } else if (result === 'denied') {
        setNotificationEnabled(false);
      }
    });
  };

  useEffect(() => {
    handleNotificationChange();
  }, []);

  return (
    <div className='flex w-full flex-col items-center gap-4'>
      <div className='w-full max-w-sm'>
        <section className='flex flex-col items-center gap-4'>
          <div className='flex w-full flex-col items-center justify-center gap-2'>
            <AvatarComponent
              className='size-16'
              imageAlt='User avatar'
            />

            <span className='text-lg font-semibold text-gray-700 dark:text-slate-200'>
              {user?.user_metadata?.name}
            </span>

            <span className='text-sm text-gray-500'>{user?.email}</span>
          </div>

          <Button
            label='Edit Profile'
            disabled
            onClick={() => handleUpdateProfile()}
            icon={<ChevronRightIcon className='size-4' />}
            iconPosition='right'
            size={'sm'}
          />
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
          Preferences
        </span>

        <section className='flex flex-col gap-4 rounded-md border border-gray-200 p-2 pt-2 dark:border-slate-800'>
          <div className='flex justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <PaintBrushIcon className='size-4' />
              </div>

              <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
                Theme
              </span>
            </div>

            <ThemeSwitchComponent showLabel={true} />
          </div>

          <div className='flex justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <BellIcon className='size-4' />
              </div>

              <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
                Notifications
              </span>
            </div>
            <Switch
              showLabel={false}
              onClick={handleNotificationChange}
              value={notificationEnabled}
            />
          </div>
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-red-500'>Danger Zone</span>
        <section className='flex flex-col gap-4 rounded-md border border-red-500 p-4'>
          <p className='flex flex-col gap-2 text-gray-600'>
            <span className='text-sm font-semibold text-red-500'>Warning</span>

            <span className='text-sm text-gray-700 dark:text-slate-200'>
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
                className={`rounded-lg bg-red-500 px-4 py-2 font-bold text-gray-50 hover:bg-red-700 focus:border-red-500 focus:outline-none focus:ring ${
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
