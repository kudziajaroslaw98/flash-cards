import { db } from '#/db/dexie.db';
import { useSessionContext } from '#/providers/session-provider.component';
import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function useClientPermissions() {
  const { user } = useSessionContext();
  const [notificationPermission, setNotificationPermission] = useState<
    'granted' | 'denied' | 'default'
  >('default');
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  const handlePermissionRequest = async () => {
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      db.metadata.update('current', {
        notificationPermission: permission,
        updatedAt: new Date().toUTCString(),
      });
      handleNotificationPermissionChange(permission);
    });
  };

  const handleNotificationPermissionChange = async (
    permission: 'granted' | 'denied' | 'default',
  ) => {
    const registration = await navigator.serviceWorker.ready;
    const pushManager = registration.pushManager;

    if (permission === 'denied' || permission === 'default') {
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
        setIsPushSubscribed(false);
      });
      return;
    } else if (
      permission === 'granted' &&
      (await pushManager.getSubscription()) !== null
    ) {
      setIsPushSubscribed(true);
      return;
    } else {
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
        setIsPushSubscribed(true);
        // TODO: add toast
      }
    }
  };

  useEffect(() => {
    if (user) {
      handlePermissionRequest();
    }
  }, [user]);

  useEffect(() => {
    const handleNotificationPermission = async () => {
      const registration = await navigator.serviceWorker.ready;
      const pushManager = registration.pushManager;
      const subscription = await pushManager.getSubscription();

      setIsPushSubscribed(subscription !== null);
    };

    handleNotificationPermission();
  }, []);

  return {
    notificationPermission,
    pushSubscribed: isPushSubscribed,
    permissionChange: handleNotificationPermissionChange,
    permissionRequest: handlePermissionRequest,
  };
}
