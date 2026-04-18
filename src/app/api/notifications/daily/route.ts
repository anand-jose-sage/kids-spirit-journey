import { NextRequest, NextResponse } from 'next/server';
import { configureWebPush, sendPushToAll, PushPayload } from '@/lib/push-server';

/**
 * GET /api/notifications/daily
 *
 * Trigger daily notifications. Call via cron job (e.g., Vercel Cron, GitHub Actions).
 * Protected by API secret in query param or authorization header.
 *
 * This sends:
 *  1. Mission unlock notification (if within agent mission window: days 1-15 from AGENT_START)
 *  2. Activity reminder (if within 30-day journey window)
 */

const JOURNEY_START = new Date('2026-04-01T00:00:00+05:30');
const AGENT_START = new Date('2026-04-15T00:00:00+05:30');

function getISTDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function getDaysSince(start: Date): number {
  const now = getISTDate();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export async function GET(request: NextRequest) {
  // Auth check
  const secret = request.nextUrl.searchParams.get('secret') || request.headers.get('authorization')?.replace('Bearer ', '');
  if (!secret || secret !== process.env.NOTIFICATIONS_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  configureWebPush();

  const results: { type: string; result: { sent: number; failed: number; cleaned: number } }[] = [];
  const journeyDay = getDaysSince(JOURNEY_START);
  const agentDay = getDaysSince(AGENT_START);

  // 1. Secret Agent mission unlock notification (days 1-15)
  if (agentDay >= 1 && agentDay <= 15) {
    const missionPayload: PushPayload = {
      title: '🕵️ New Mission Unlocked!',
      body: `Mission ${agentDay} is now available. Can you identify the secret person?`,
      url: `/dashboard/secret-agent/${agentDay}`,
      tag: `mission-day-${agentDay}`,
    };
    const result = await sendPushToAll(missionPayload);
    results.push({ type: 'mission-unlock', result });
  }

  // 2. Daily activity reminder (30-day journey, days 1-30)
  if (journeyDay >= 1 && journeyDay <= 30) {
    const activityPayload: PushPayload = {
      title: '✨ Daily Activity Reminder',
      body: `Day ${journeyDay} activities are waiting for you! Don't break your streak.`,
      url: `/dashboard/activity/${journeyDay}`,
      tag: `activity-day-${journeyDay}`,
    };
    const result = await sendPushToAll(activityPayload);
    results.push({ type: 'activity-reminder', result });
  }

  return NextResponse.json({ ok: true, journeyDay, agentDay, results });
}
