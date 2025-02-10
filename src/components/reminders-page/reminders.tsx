'use client';
import { db } from '#/db/dexie.db';
import { useAppContext } from '#/providers/app-context';
import { useSessionContext } from '#/providers/session-provider.component';
import type { Reminder } from '#/types/reminder.type';
import { BellOff, BellPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../_ui/button/button';
import { ReminderActions } from './reminder-actions';
import { ReminderFilters } from './reminder-filters';
import { RemindersList } from './reminders-list';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function Reminders() {
  const [selected, setSelected] = useState<Reminder[]>([]);
  const [filtered, setFiltered] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<
    'granted' | 'denied' | 'default'
  >();
  const { reminders } = useAppContext();
  const { user } = useSessionContext();

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

  const handleNotificationChange = async () => {
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

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='w-52 text-green-400'>Your Reminders</h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{reminders.length} reminders created</span>
          </span>
        </div>

        {permission === 'granted' && (
          <ReminderFilters setFiltered={setFiltered} />
        )}
      </div>

      {permission === 'granted' ? (
        <>
          <RemindersList
            selected={selected}
            filtered={filtered}
            setSelected={setSelected}
          />

          <ReminderActions
            selected={selected}
            setSelected={setSelected}
          />
        </>
      ) : (
        <div className='flex flex-col items-center justify-center py-10 text-center'>
          <BellOff className='mb-8 size-12 text-green-500' />
          <span>You need to allow notifications to use this feature.</span>
          <span className='mt-4'>
            <Button
              alt='Allow notifications'
              onClick={handleNotificationChange}
              label='Allow notifications'
              size={'sm'}
              iconPosition='right'
              icon={<BellPlus className='size-4' />}
            />
          </span>
        </div>
      )}
    </div>
  );
}
