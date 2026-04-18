import { supabase } from './supabase';

/**
 * Client-side push notification helpers.
 * Uses the Web Push API with VAPID.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/** Convert URL-safe base64 to Uint8Array (required by PushManager) */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Check if push notifications are supported */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** Get current permission state */
export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/** Register service worker if not already registered */
async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (reg) return reg;
  return navigator.serviceWorker.register('/sw.js');
}

/** Subscribe the user to push notifications and store in Supabase */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await getServiceWorkerRegistration();

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const subJson = subscription.toJSON();
  if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) return false;

  // Store subscription in Supabase
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
    },
    { onConflict: 'user_id,endpoint' }
  );

  if (error) {
    console.error('Failed to save push subscription:', error.message);
    return false;
  }

  return true;
}

/** Unsubscribe from push and remove from Supabase */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!registration) return false;

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    // Remove from Supabase
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);
  }

  return true;
}

/** Check if the user already has an active push subscription */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!registration) return false;

  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
