'use client';
import { useSessionContext } from '#/providers/session-provider.component';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationButton() {
  const { user } = useSessionContext();

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

    await fetch('/api/notification/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }), // Send user ID
      headers: { 'Content-Type': 'application/json' },
    });

    alert('Subscribed to notifications!');
  };

  return <button onClick={subscribeToNotifications}>Subscribe</button>;
}
