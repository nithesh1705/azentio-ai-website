import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getNotificationBroadcasts,
  getNotificationTemplates,
  estimateRecipients,
  composeNotificationBroadcast,
  recallNotificationBroadcast,
} from '@/server/dal/admin/notifications';

function getActor(req: NextRequest, body?: any): Actor {
  if (body?.actor) return body.actor;
  return {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };
}

export async function GET(req: NextRequest) {
  try {
    const actor = getActor(req);
    const searchParams = req.nextUrl.searchParams;

    if (searchParams.get('preview') === 'true') {
      const scope = searchParams.get('scope') as any;
      const orgIds = searchParams.get('orgIds')?.split(',').filter(Boolean);
      const roles = searchParams.get('roles')?.split(',').filter(Boolean);
      const userIds = searchParams.get('userIds')?.split(',').filter(Boolean);

      const preview = estimateRecipients(actor, {
        scope: scope || 'all_employees',
        orgIds,
        roles,
        userIds,
      });
      return NextResponse.json(preview);
    }

    const broadcasts = getNotificationBroadcasts(actor);
    const templates = getNotificationTemplates(actor);

    return NextResponse.json({
      broadcasts,
      templates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    if (body.action === 'recall') {
      const result = recallNotificationBroadcast(actor, body.broadcastId);
      return NextResponse.json(result);
    }

    const result = composeNotificationBroadcast(actor, {
      title: body.title,
      message: body.message,
      type: body.type,
      severity: body.severity,
      targetAudience: body.targetAudience,
      linkUrl: body.linkUrl,
      channels: body.channels || ['in_app'],
      scheduledAt: body.scheduledAt,
      idempotencyKey: body.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
