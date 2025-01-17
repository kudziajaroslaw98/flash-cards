'use client';

import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import AvatarComponent from '#/components/_ui/avatar/avatar';
import { Button } from '#/components/_ui/button/button';
import Switch from '#/components/_ui/switch/switch';
import ThemeSwitchComponent from '#/components/theme-switch/theme-switch';
import { useSessionContext } from '#/providers/session-provider.component';
import { capitalize } from '#/shared/utils/helpers';
import { Banknote, Bell, Palette } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user, deleteUser, pickedPlan, isPlanActive } = useSessionContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

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

  const handleClearData = () => {
    localStorage.removeItem('flashcards');
    localStorage.removeItem('sets');
    localStorage.removeItem('metadata');
    localStorage.removeItem('theme');
    window.location.reload();
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
              imageSrc={user?.user_metadata?.avatar_url}
            />

            <span className='text-lg font-semibold text-gray-700 dark:text-slate-200'>
              {user?.user_metadata?.name}
            </span>

            <span className='text-sm text-gray-500'>{user?.email}</span>
          </div>
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
          Premium
        </span>

        <section className='flex flex-col gap-4 rounded-md border border-gray-200 p-4 dark:border-slate-800'>
          <div className='flex items-center justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <Banknote className='size-4' />
              </div>

              <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
                Picked Plan
              </span>
            </div>

            <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
              {isPlanActive ? capitalize(pickedPlan) : 'Free'}
            </span>
          </div>

          <Link href='/pricing'>
            <Button
              label='Change Plan'
              size='full'
              className='max-w-full'
              alt='Change plan'
            ></Button>
          </Link>
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
          Preferences
        </span>

        <section className='flex flex-col gap-4 rounded-md border border-gray-200 p-4 dark:border-slate-800'>
          <div className='flex justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <Palette className='size-4' />
              </div>

              <span className='text-sm font-semibold text-gray-700 dark:text-slate-200'>
                Theme
              </span>
            </div>

            <ThemeSwitchComponent
              showLabel={true}
              variant='vertical-reversed'
            />
          </div>

          <div className='flex justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <Bell className='size-4' />
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
              Clearing local data will{' '}
              <span className='font-bold text-red-500'>remove all</span> your
              local data.
            </span>
          </p>

          <AlertDialog
            headerText='Clear Data'
            bodyText='Are you sure you want to clear your data? This action cannot be undone.'
            trigger={
              <button
                disabled={isClearing}
                className={`rounded-lg bg-red-500 px-4 py-2 font-bold text-gray-50 hover:bg-red-700 focus:border-red-500 focus:outline-none focus:ring ${
                  isClearing ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {isClearing ? 'Clearing...' : 'Clear Local Data'}
              </button>
            }
            onAccept={handleClearData}
            onCancel={() => setIsClearing(false)}
          ></AlertDialog>
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
