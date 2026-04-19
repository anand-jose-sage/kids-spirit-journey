import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

/**
 * Server-side Supabase admin client (uses service role key).
 * Only used in API routes — never expose to client.
 */
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

/** Configure web-push with VAPID keys (call once per request) */
export function configureWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@shiloha.in',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

/** Send push notification to a single subscription. Returns false if expired/invalid. */
export async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 } // 1 hour
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    // 404 or 410 = subscription expired/invalid
    if (status === 404 || status === 410) return false;
    console.error('Push send error:', err);
    return false;
  }
}

/** Send push to all subscribers, cleaning up expired subscriptions */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; failed: number; cleaned: number }> {
  const supabase = getAdminSupabase();
  const { data: subs, error } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth');
  if (error || !subs) return { sent: 0, failed: 0, cleaned: 0 };

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, payload);
      if (ok) {
        sent++;
      } else {
        failed++;
        expired.push(sub.id);
      }
    })
  );

  // Clean up expired subscriptions
  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expired);
  }

  return { sent, failed, cleaned: expired.length };
}

/** Send push to a specific user */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number; debug?: string }> {
  const supabase = getAdminSupabase();
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  if (error) return { sent: 0, failed: 0, debug: `db error: ${error.message}` };
  if (!subs || subs.length === 0) return { sent: 0, failed: 0, debug: `no subscriptions found for user ${userId}` };

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      const ok = await sendPush(sub, payload);
      if (ok) {
        sent++;
      } else {
        failed++;
        expired.push(sub.id);
      }
    })
  );

  if (expired.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', expired);
  }

  return { sent, failed };
}
