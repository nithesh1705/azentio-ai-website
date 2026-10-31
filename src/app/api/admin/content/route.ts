import { NextRequest, NextResponse } from 'next/server';
import {
  getContentItems,
  createContentItem,
  publishContentItem,
  unpublishContentItem,
  archiveContentItem,
} from '@/server/dal/admin/content';
import { Actor, ContentType, ContentStatus, ContentAudience } from '@/types';

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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as ContentType | undefined;
    const status = searchParams.get('status') as ContentStatus | undefined;
    const audience = searchParams.get('audience') as ContentAudience | undefined;
    const search = searchParams.get('search') || undefined;

    const actor = getActor(req);
    const items = getContentItems(actor, { type, status, audience, search });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { action, id } = body;

    if (action === 'publish') {
      const item = publishContentItem(actor, id);
      return NextResponse.json({ success: true, item });
    }

    if (action === 'unpublish') {
      const item = unpublishContentItem(actor, id);
      return NextResponse.json({ success: true, item });
    }

    if (action === 'archive') {
      const item = archiveContentItem(actor, id);
      return NextResponse.json({ success: true, item });
    }

    // Standard Create
    const created = createContentItem(actor, body);
    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

