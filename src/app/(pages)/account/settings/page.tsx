'use client';

import { Accordion } from '#/components/_ui/accordion/accordion';
import { AlertDialog } from '#/components/_ui/alert-dialog/alert-dialog';
import AvatarComponent from '#/components/_ui/avatar/avatar';
import { Button } from '#/components/_ui/button/button';
import Switch from '#/components/_ui/switch/switch';
import Tooltip from '#/components/_ui/tooltip/tooltip';
import ThemeSwitchComponent from '#/components/theme-switch/theme-switch';
import { db } from '#/db/dexie.db';
import { useSessionContext } from '#/providers/session-provider.component';
import { capitalize } from '#/shared/utils/helpers';
import { useLiveQuery } from 'dexie-react-hooks';
import { Banknote, Bell, Info, Palette } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function SettingsPage() {
  const { user, deleteUser, pickedPlan, isPlanActive } = useSessionContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  // eslint-disable-next-line no-undef
  const [permission, setPermission] = useState<
    'granted' | 'denied' | 'default'
  >();
  const metadata = useLiveQuery(() =>
    db.table('metadata').toCollection().first(),
  );

  useEffect(() => {
    const handleNotificationPermission = async () => {
      const registration = await navigator.serviceWorker.ready;
      const pushManager = registration.pushManager;
      const subscription = await pushManager.getSubscription();

      if (subscription) {
        setPermission('granted');
        db.metadata.update('current', {
          notificationPermission: 'granted',
        });
      } else {
        setPermission('denied');
        db.metadata.update('current', {
          notificationPermission: 'denied',
        });
      }
    };
    handleNotificationPermission();
  }, []);

  const handleDeleteUser = () => {
    setIsDeleting(true);
    deleteUser();
  };

  const handleNotificationChange = async () => {
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const pushManager = registration.pushManager;
      pushManager.getSubscription().then(async (subscription) => {
        if (subscription) {
          const response = await fetch('/api/notification/unsubscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }), // Send user ID
            headers: { 'Content-Type': 'application/json' },
          }).then((res) => res.json());

          if (response.success) {
            subscription.unsubscribe();
            // TODO: add toast
          }
        }
      });
      setPermission('denied');
      db.metadata.update('current', { notificationPermission: 'denied' });
      return;
    } else if (permission === 'denied') {
      setPermission('default');
      db.metadata.update('current', { notificationPermission: 'default' });
      return;
    }

    await Notification.requestPermission().then(async (result) => {
      if (result === 'granted') {
        setPermission('granted');
        db.metadata.update('current', { notificationPermission: 'granted' });
        const subscribeToNotifications = async () => {
          if (
            !('serviceWorker' in navigator) ||
            !('PushManager' in window) ||
            !VAPID_PUBLIC_KEY ||
            !user
          ) {
            return;
          }

          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY,
          });

          const response = await fetch('/api/notification/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription }), // Send user ID
            headers: { 'Content-Type': 'application/json' },
          }).then((res) => res.json());

          if (response.success) {
            // TODO: todo: add toast
          }
        };

        subscribeToNotifications();
      } else if (result === 'denied') {
        db.metadata.update('current', { notificationPermission: 'denied' });
      }
    });
  };

  const handleMarketingConsent = () => {
    db.metadata.update('current', {
      marketingConsent: !(metadata.marketingConsent ?? false),
    });
  };

  const handleClearData = () => {
    setIsClearing(true);
    db.flashcards.clear();
    db.sets.clear();
    db.reviewLogs.clear();
    db.focusSessions.clear();
    db.dailyStats.clear();
    db.metadata.clear();
    setIsClearing(false);
  };

  const InfoTooltip = (
    <span className='flex flex-col gap-1'>
      <span className='!font-bold'>Stay in the know!</span>
      <span className='font-medium'>
        Receive emails with the latest features, updates, and exclusive offers.
      </span>
    </span>
  );

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
              value={permission === 'granted'}
            />
          </div>

          <div className='flex justify-between gap-2 rounded-md'>
            <div className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-md bg-gray-200 text-gray-700 dark:bg-slate-900 dark:text-slate-200'>
                <Bell className='size-4' />
              </div>

              <span className='flex gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200'>
                <span>Marketing Consent</span>{' '}
                <Tooltip
                  position='top'
                  content={InfoTooltip}
                  className='w-80 text-wrap'
                >
                  <Info className='size-3 cursor-pointer text-green-600 dark:text-green-400' />
                </Tooltip>
              </span>
            </div>
            <Switch
              showLabel={false}
              onClick={handleMarketingConsent}
              value={metadata?.marketingConsent ?? false}
            />
          </div>
        </section>
      </div>

      <div className='w-full max-w-sm'>
        <Accordion>
          <Accordion.Item
            title='Danger Zone'
            variant='destructive'
          >
            <section className='flex flex-col gap-4'>
              <p className='flex flex-col gap-2 text-gray-600'>
                <span className='text-sm font-semibold text-red-500'>
                  Warning
                </span>

                <span className='text-sm text-gray-700 dark:text-slate-200'>
                  Clearing local data will{' '}
                  <span className='font-bold text-red-500'>remove all</span>{' '}
                  your local data.
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
                <span className='text-sm font-semibold text-red-500'>
                  Warning
                </span>

                <span className='text-sm text-gray-700 dark:text-slate-200'>
                  Deleting your account will permanently{' '}
                  <span className='font-bold text-red-500'>remove all</span>{' '}
                  your data.
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
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
