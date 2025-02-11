'use client';
import { useClientPermissions } from '#/hooks/use-client-permissions';
import { useAppContext } from '#/providers/app-context';
import type { Reminder } from '#/types/reminder.type';
import { BellOff, BellPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../_ui/button/button';
import { ReminderActions } from './reminder-actions';
import { ReminderFilters } from './reminder-filters';
import { RemindersList } from './reminders-list';

export function Reminders() {
  const { notificationPermission, pushSubcribed, permissionRequest } =
    useClientPermissions();
  const [selected, setSelected] = useState<Reminder[]>([]);
  const [filtered, setFiltered] = useState<Reminder[]>([]);
  const { reminders } = useAppContext();

  return (
    <div className='flex w-full flex-col gap-6'>
      <div className='flex w-full flex-col items-center justify-center gap-8 sm:items-start md:justify-between'>
        <div className='flex w-full flex-col items-center justify-center gap-2 sm:items-start md:justify-between'>
          <h4 className='w-52 text-green-400'>Your Reminders</h4>
          <span className='flex flex-wrap items-center gap-4 text-center text-sm text-gray-500 dark:text-slate-400'>
            <span>{reminders.length} reminders created</span>
          </span>
        </div>

        {notificationPermission === 'granted' && (
          <ReminderFilters setFiltered={setFiltered} />
        )}
      </div>

      {notificationPermission === 'granted' && pushSubcribed ? (
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
          {notificationPermission === 'default' ? (
            <>
              <BellOff className='mb-8 size-12 text-green-500' />
              <span>You need to allow notifications to use this feature.</span>
              <span className='mt-4'>
                <Button
                  alt='Allow notifications'
                  onClick={permissionRequest}
                  label='Allow notifications'
                  size={'sm'}
                  iconPosition='right'
                  icon={<BellPlus className='size-4' />}
                />
              </span>
            </>
          ) : (
            <>
              <BellOff className='mb-8 size-12 text-green-500' />
              <span>
                You have blocked the notifications, you need to allow them{' '}
                <b className='text-gray-800 dark:text-slate-200'>
                  {' '}
                  in the settings{' '}
                </b>{' '}
                to use this feature.
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
