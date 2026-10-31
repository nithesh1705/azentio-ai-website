import { NextRequest, NextResponse } from 'next/server';
import { getContentItemById, updateContentItem } from '@/server/dal/admin/content';
import { Actor } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actor: Actor = {
      userId: 'usr-admin-max',
      name: 'Max Verstappen',
      email: 'max_verstappen@azentio.com',
      platformGrants: ['portal_admin', 'content_publisher'],
      memberships: [],
      activeTenantId: null,
      isVerifiedEmployee: true,
    };

    const item = getContentItemById(actor, id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Content item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actor: Actor = body.actor || {
      userId: 'usr-admin-max',
      name: 'Max Verstappen',
      email: 'max_verstappen@azentio.com',
      platformGrants: ['portal_admin', 'content_publisher'],
      memberships: [],
      activeTenantId: null,
      isVerifiedEmployee: true,
    };

    const updated = updateContentItem(actor, id, body);
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

