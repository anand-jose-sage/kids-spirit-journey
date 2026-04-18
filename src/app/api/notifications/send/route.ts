import { NextRequest, NextResponse } from 'next/server';
import { configureWebPush, sendPushToAll, sendPushToUser, PushPayload } from '@/lib/push-server';

/**
 * POST /api/notifications/send
 *
 * Send push notifications. Protected by an API secret.
 *
 * Body:
 *   type: 'all' | 'user'
 *   userId?: string (required when type='user')
 *   title: string
 *   body: string
 *   url?: string
 *   tag?: string
 */
export async function POST(request: NextRequest) {
  // Verify API secret to prevent unauthorized sends
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.NOTIFICATIONS_API_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, userId, title, body: msgBody, url, tag } = body as {
    type?: string;
    userId?: string;
    title?: string;
    body?: string;
    url?: string;
    tag?: string;
  };

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
  }

  if (type !== 'all' && type !== 'user') {
    return NextResponse.json({ error: 'type must be "all" or "user"' }, { status: 400 });
  }

  if (type === 'user' && !userId) {
    return NextResponse.json({ error: 'userId required for type=user' }, { status: 400 });
  }

  configureWebPush();

  const payload: PushPayload = { title, body: msgBody, url, tag };

  if (type === 'all') {
    const result = await sendPushToAll(payload);
    return NextResponse.json({ ok: true, ...result });
  } else {
    const result = await sendPushToUser(userId!, payload);
    return NextResponse.json({ ok: true, ...result });
  }
}
